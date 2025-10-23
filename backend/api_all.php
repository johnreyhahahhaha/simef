<?php
// project/clinic/backend/api_all.php

// ----------------------------------------------------------------------
// --- CORS CONFIGURATION AND PREFLIGHT HANDLER (FIXES NETWORK ERROR) ---
// ----------------------------------------------------------------------
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
// Tiyakin na kasama ang OPTIONS para sa preflight check
header("Access-Control-Allow-Methods: POST, GET, PUT, OPTIONS"); 
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Mabilisang sagutin ang OPTIONS (preflight) request ng browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(); // Tinitiyak na walang ibang PHP code ang tatakbo
}
// ----------------------------------------------------------------------


// --- 1. Database Connection ---
$host = "localhost";
$db_name = "admins"; // I-check kung ito ang tamang database name
$username = "root";
$password = "";

try {
    // Gumamit ng $pdo variable name para mas tugma sa convention
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $exception) {
    // 503 Service Unavailable (kung hindi makakonek sa database)
    http_response_code(503); 
    echo json_encode(array("message" => "Database connection error: " . $exception->getMessage()));
    exit();
}

// Get Request details
$request_method = $_SERVER["REQUEST_METHOD"];
$input = json_decode(file_get_contents("php://input"), true);
$route = isset($_GET['route']) ? $_GET['route'] : '';

// --- IMPORTANT: Session/Staff/Doctor ID Placeholder ---
// Sa isang tunay na sistema, ito ay galing sa session/login
$current_user_id = 1; // Default ID for Staff/Doctor actions

// --- Audit helper: write into audit_log table (assumes table exists) ---
function write_audit($pdo, $user_id, $action, $details) {
    try {
        $sql = "INSERT INTO audit_log (user_id, action, details, created_at) VALUES (:uid, :act, :det, CURRENT_TIMESTAMP())";
        $st = $pdo->prepare($sql);
        $st->bindParam(':uid', $user_id);
        $st->bindParam(':act', $action);
        $st->bindParam(':det', $details);
        $st->execute();
    } catch (Exception $e) {
        // Silently ignore audit errors so they don't break main flows
    }
}

switch ($request_method) {
    
    // --- POST Requests (Create) ---
    case 'POST':
        if ($route === 'patients/register') {
            // Staff: Patient Registration Logic
            if (empty($input['first_name']) || empty($input['last_name']) || empty($input['birth_date'])) {
                http_response_code(400);
                echo json_encode(array("message" => "Missing required patient fields (First Name, Last Name, Birth Date)."));
                break;
            }

            $query = "INSERT INTO patients (first_name, last_name, birth_date, gender, contact_number, address, hmo_id, registered_by_staff_id) 
                      VALUES (:fn, :ln, :bd, :g, :cn, :a, :hmo, :rid)";
            $stmt = $pdo->prepare($query);
            
            // Handle optional/null fields
            $last_name = $input['last_name'] ?? null;
            $gender = $input['gender'] ?? null;
            // Tiyakin na ang empty string ay nagiging NULL
            $contact_number = empty($input['contact_number']) ? null : $input['contact_number']; 
            $address = empty($input['address']) ? null : $input['address'];
            $hmo_id = empty($input['hmo_id']) ? null : $input['hmo_id']; 

            $stmt->bindParam(':fn', $input['first_name']);
            $stmt->bindParam(':ln', $last_name);
            $stmt->bindParam(':bd', $input['birth_date']);
            $stmt->bindParam(':g', $gender);
            $stmt->bindParam(':cn', $contact_number);
            $stmt->bindParam(':a', $address);
            $stmt->bindParam(':hmo', $hmo_id);
            $stmt->bindParam(':rid', $current_user_id); // Staff ID

            if ($stmt->execute()) {
                http_response_code(201);
                // Audit log
                write_audit($pdo, $current_user_id, 'patient_register', json_encode(['patient' => $input['first_name'] . ' ' . $last_name]));
                echo json_encode(array("message" => "Patient registered successfully."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Unable to register patient."));
            }
        } 
        
        else if ($route === 'appointments/schedule') {
            // Staff: Appointment Scheduling Logic
            if (empty($input['patient_id']) || empty($input['doctor_id']) || empty($input['appointment_date'])) {
                http_response_code(400);
                echo json_encode(array("message" => "Missing required appointment fields."));
                break;
            }
            
            $query = "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason_for_visit) 
                      VALUES (:pid, :did, :ad, :at, :rv)";
            $stmt = $pdo->prepare($query);
            
            $stmt->bindParam(':pid', $input['patient_id']);
            $stmt->bindParam(':did', $input['doctor_id']);
            $stmt->bindParam(':ad', $input['appointment_date']);
            $stmt->bindParam(':at', $input['appointment_time']);
            $stmt->bindParam(':rv', $input['reason_for_visit']);
            
            if ($stmt->execute()) {
                http_response_code(201);
                write_audit($pdo, $current_user_id, 'appointment_schedule', json_encode(['patient_id' => $input['patient_id'], 'doctor_id' => $input['doctor_id'], 'date' => $input['appointment_date'], 'time' => $input['appointment_time']]));
                echo json_encode(array("message" => "Appointment scheduled successfully."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Unable to schedule appointment."));
            }
        }
        
        else if ($route === 'records/create') {
            // Doctor: Create Medical Record
            if (empty($input['diagnosis']) || empty($input['patient_id'])) {
                http_response_code(400);
                echo json_encode(array("message" => "Diagnosis and Patient ID are required."));
                break;
            }
            
            // Step 1: Insert Medical Record
            $query = "INSERT INTO medical_records (patient_id, doctor_id, appointment_id, chief_complaint, diagnosis, treatment_plan, prescription, follow_up_date) 
                      VALUES (:pid, :did, :aid, :cc, :d, :tp, :p, :fd)";
            $stmt = $pdo->prepare($query);
            
            $follow_up_date = empty($input['follow_up_date']) ? null : $input['follow_up_date'];
            
            $stmt->bindParam(':pid', $input['patient_id']);
            $stmt->bindParam(':did', $input['doctor_id']);
            $stmt->bindParam(':aid', $input['appointment_id']);
            $stmt->bindParam(':cc', $input['chief_complaint']);
            $stmt->bindParam(':d', $input['diagnosis']);
            $stmt->bindParam(':tp', $input['treatment_plan']);
            $stmt->bindParam(':p', $input['prescription']);
            $stmt->bindParam(':fd', $follow_up_date); // Handle optional date

            if ($stmt->execute()) {
                // Step 2: Update Appointment Status to 'Completed'
                $update_query = "UPDATE appointments SET status = 'Completed' WHERE appointment_id = :aid";
                $update_stmt = $pdo->prepare($update_query);
                $update_stmt->bindParam(':aid', $input['appointment_id']);
                $update_stmt->execute();

                // Audit: record created by doctor
                write_audit($pdo, $input['doctor_id'] ?? $current_user_id, 'record_create', json_encode(['appointment_id' => $input['appointment_id'], 'patient_id' => $input['patient_id']]));

                http_response_code(201);
                echo json_encode(array("message" => "Record saved and appointment completed."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Unable to save medical record."));
            }
        }
        
        // 🔑 NEW: Nurse Dashboard - Save or Update Vitals and Change Status
        else if ($route === 'nurse/vitals') {
            $data = $input;

            $appointment_id = $data['appointment_id'] ?? null;
            $nurse_id = $data['nurse_id'] ?? null; 
            $bp = $data['blood_pressure'] ?? null;
            $temp = $data['temperature'] ?? null;
            $weight = $data['weight'] ?? null;
            $height = $data['height'] ?? null;
            $notes = $data['nurse_notes'] ?? '';

            if (!$appointment_id || !$nurse_id || !$bp || !$temp) {
                http_response_code(400);
                echo json_encode(["message" => "Incomplete data. Appointment ID, Nurse ID, BP, and Temperature are required."]);
                break;
            }

            try {
                // 1. Check if Vitals record exists for this appointment
                $check_sql = "SELECT appointment_id FROM vitals WHERE appointment_id = ?";
                $check_stmt = $pdo->prepare($check_sql);
                $check_stmt->execute([$appointment_id]);
                $vitals_exists = $check_stmt->fetch();

                $message = "";

                if ($vitals_exists) {
                    // Vitals EXIST -> UPDATE
                    $vitals_sql = "UPDATE vitals SET 
                                blood_pressure = ?, temperature = ?, weight = ?, height = ?, nurse_notes = ?, nurse_id = ?, updated_at = CURRENT_TIMESTAMP() 
                                WHERE appointment_id = ?";
                    $vitals_stmt = $pdo->prepare($vitals_sql);
                    $vitals_stmt->execute([$bp, $temp, $weight, $height, $notes, $nurse_id, $appointment_id]);
                    $message = "Vitals updated successfully.";
                } else {
                    // Vitals DO NOT EXIST -> INSERT
                    $vitals_sql = "INSERT INTO vitals (appointment_id, nurse_id, blood_pressure, temperature, weight, height, nurse_notes) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)";
                    $vitals_stmt = $pdo->prepare($vitals_sql);
                    $vitals_stmt->execute([$appointment_id, $nurse_id, $bp, $temp, $weight, $height, $notes]);
                    $message = "Vitals recorded successfully.";
                }

                // 2. Update Appointment Status to 'Vitals Done'
                $status_sql = "UPDATE appointments SET status = 'Vitals Done' WHERE appointment_id = ? AND (status = 'Scheduled' OR status = 'Vitals Done')";
                $status_stmt = $pdo->prepare($status_sql);
                $status_stmt->execute([$appointment_id]);

                http_response_code(200);
                echo json_encode(["message" => $message . " Patient is now queued for Doctor review ('Vitals Done')."]);

                // Audit vitals recorded/updated
                write_audit($pdo, $nurse_id ?? $current_user_id, 'vitals_' . ($vitals_exists ? 'update' : 'create'), json_encode(['appointment_id' => $appointment_id, 'bp' => $bp, 'temp' => $temp]));

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Vitals/Status update failed: " . $e->getMessage()]);
            }
        }
        
        break;

    // --- GET Requests (Read) ---
    case 'GET':
        if ($route === 'patients') {
            // Staff: Get All Patients
            $query = "SELECT patient_id, first_name, last_name, birth_date, contact_number, address, gender, hmo_id FROM patients ORDER BY patient_id DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // 🔑 NEW: Get Single Medical Record by Appointment ID or Record ID
        else if ($route === 'records/get') {
            $appointment_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            
            if ($appointment_id === 0) {
                http_response_code(400);
                echo json_encode(array("message" => "Appointment ID required to view record."));
                break;
            }
            
            // Kukunin natin ang record gamit ang appointment_id
            $query = "
                SELECT 
                    mr.*, 
                    p.first_name, p.last_name, p.birth_date, p.gender, 
                    s.full_name as doctor_name
                FROM medical_records mr
                JOIN patients p ON mr.patient_id = p.patient_id
                JOIN staff s ON mr.doctor_id = s.id
                WHERE mr.appointment_id = :aid"; // Gamit ang appointment_id

            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':aid', $appointment_id, PDO::PARAM_INT);
            $stmt->execute();
            $record = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($record) {
                http_response_code(200);
                echo json_encode($record);
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Medical record not found for this appointment."));
            }
        }
        
        else if ($route === 'staff/doctors') {
            // Staff/Doctor: Get Doctor List
            $query = "SELECT id, full_name, position FROM staff WHERE position = 'Doctor' ORDER BY full_name";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        
        else if ($route === 'appointments') {
            // Staff: Get All Appointments (for display and management)
            $query = "
                SELECT 
                    a.appointment_id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, a.reason_for_visit, a.status,
                    p.first_name, p.last_name,
                    s.full_name as doctor_name
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN staff s ON a.doctor_id = s.id
                ORDER BY a.appointment_date DESC, a.appointment_time DESC";
                
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }

        // 🔑 NEW: Nurse Dashboard - Get All Appointments for TODAY with Vitals
        else if ($route === 'appointments/today') {
            $today = date('Y-m-d');
            
            // SQL Query: I-join ang appointments sa patients, staff (para sa doctor), at vitals (LEFT JOIN)
            $query = "SELECT 
                        a.appointment_id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, a.reason_for_visit, a.status,
                        p.first_name, p.last_name, 
                        s.full_name AS doctor_name,
                        v.blood_pressure, v.temperature, v.weight, v.height, v.nurse_notes
                    FROM appointments a
                    LEFT JOIN patients p ON a.patient_id = p.patient_id
                    LEFT JOIN staff s ON a.doctor_id = s.id
                    LEFT JOIN vitals v ON a.appointment_id = v.appointment_id
                    WHERE a.appointment_date = :today
                    ORDER BY a.appointment_time ASC";
                    
            $stmt = $pdo->prepare($query);
            
            try {
                $stmt->execute([':today' => $today]);
                $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // I-process ang data para gawing nested object ang vitals (kung meron)
                $results = array_map(function($app) {
                    $vitalsData = null;
                    // Check kung may blood_pressure, ibig sabihin may vitals data
                    if ($app['blood_pressure'] !== null) { 
                        $vitalsData = [
                            'blood_pressure' => $app['blood_pressure'],
                            'temperature' => $app['temperature'],
                            'weight' => $app['weight'],
                            'height' => $app['height'],
                            'nurse_notes' => $app['nurse_notes'],
                        ];
                    }
                    
                    // Tanggalin ang duplicate na vitals keys mula sa main array
                    unset($app['blood_pressure'], $app['temperature'], $app['weight'], $app['height'], $app['nurse_notes']);
                    
                    // Gawin nating 'doctor_name' ang full_name, at 'patient_name' ang first_name/last_name para tugma sa React component
                    $app['patient_name'] = $app['first_name'] . ' ' . $app['last_name'];
                    // Para mas malinis, tanggalin natin ang raw first_name/last_name
                    unset($app['first_name'], $app['last_name']); 
                    
                    $app['vitals'] = $vitalsData; // Ilagay ang nested vitals object
                    
                    return $app;
                }, $appointments);

                http_response_code(200);
                echo json_encode($results);

            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Database error in fetching today's appointments: " . $e->getMessage()]);
            }
        }

        else if ($route === 'doctor/appointments') {
            // Doctor: Get ONLY HIS/HER Appointments
            $doctor_id = isset($_GET['doctor_id']) ? (int)$_GET['doctor_id'] : 0;
            if ($doctor_id === 0) {
                   http_response_code(400);
                   echo json_encode(array("message" => "Doctor ID required."));
                   break;
            }
            // Include vitals (if any) so the doctor can see nurse intake data (blood pressure, temp, notes)
            $query = "
                SELECT 
                    a.appointment_id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, a.reason_for_visit, a.status,
                    p.first_name, p.last_name, p.birth_date, p.gender,
                    s.full_name as doctor_name,
                    v.blood_pressure, v.temperature, v.weight, v.height, v.nurse_notes
                FROM appointments a
                JOIN patients p ON a.patient_id = p.patient_id
                JOIN staff s ON a.doctor_id = s.id
                LEFT JOIN vitals v ON a.appointment_id = v.appointment_id
                WHERE a.doctor_id = :did 
                ORDER BY a.appointment_date ASC, a.appointment_time ASC";

            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':did', $doctor_id, PDO::PARAM_INT);
            $stmt->execute();

            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Process rows to nest vitals as an object (consistent with appointments/today)
            $results = array_map(function($app) {
                $vitalsData = null;
                if ($app['blood_pressure'] !== null) {
                    $vitalsData = [
                        'blood_pressure' => $app['blood_pressure'],
                        'temperature' => $app['temperature'],
                        'weight' => $app['weight'],
                        'height' => $app['height'],
                        'nurse_notes' => $app['nurse_notes'],
                    ];
                }

                // Remove flat vitals keys to avoid duplication
                unset($app['blood_pressure'], $app['temperature'], $app['weight'], $app['height'], $app['nurse_notes']);

                // Add patient_name and nested vitals
                $app['patient_name'] = $app['first_name'] . ' ' . $app['last_name'];
                unset($app['first_name'], $app['last_name']);

                $app['vitals'] = $vitalsData;

                return $app;
            }, $rows);

            echo json_encode($results);
        }

        // --- ADMIN: Aggregates and Audit Log ---
        else if ($route === 'admin/audit') {
            // Return a quick snapshot: recent staff actions, recent appointments, recent vitals, recent records
            try {
                $out = [];

                // Recent staff (last 50)
                $stmt = $pdo->prepare("SELECT id, username, full_name, position, email, created_at FROM staff ORDER BY id DESC LIMIT 50");
                $stmt->execute();
                $out['staff'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Recent patients (last 50)
                $stmt = $pdo->prepare("SELECT patient_id, first_name, last_name, birth_date, contact_number, created_at FROM patients ORDER BY patient_id DESC LIMIT 50");
                $stmt->execute();
                $out['patients'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Recent appointments (last 100)
                $stmt = $pdo->prepare("SELECT a.appointment_id, a.patient_id, a.doctor_id, a.appointment_date, a.appointment_time, a.status, p.first_name, p.last_name, s.full_name as doctor_name FROM appointments a LEFT JOIN patients p ON a.patient_id = p.patient_id LEFT JOIN staff s ON a.doctor_id = s.id ORDER BY a.appointment_date DESC, a.appointment_time DESC LIMIT 100");
                $stmt->execute();
                $out['appointments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Recent vitals (last 100)
                $stmt = $pdo->prepare("SELECT v.*, a.appointment_date, a.appointment_time, p.first_name, p.last_name FROM vitals v LEFT JOIN appointments a ON v.appointment_id = a.appointment_id LEFT JOIN patients p ON a.patient_id = p.patient_id ORDER BY v.updated_at DESC LIMIT 100");
                $stmt->execute();
                $out['vitals'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Recent medical records (last 100)
                $stmt = $pdo->prepare("SELECT mr.*, p.first_name, p.last_name, s.full_name as doctor_name FROM medical_records mr LEFT JOIN patients p ON mr.patient_id = p.patient_id LEFT JOIN staff s ON mr.doctor_id = s.id ORDER BY mr.created_at DESC LIMIT 100");
                $stmt->execute();
                $out['records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Recent audit logs (last 200)
                $stmt = $pdo->prepare("SELECT al.*, s.full_name as user_name FROM audit_log al LEFT JOIN staff s ON al.user_id = s.id ORDER BY al.created_at DESC LIMIT 200");
                $stmt->execute();
                $out['audit'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                http_response_code(200);
                echo json_encode($out);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(["message" => "Admin audit fetch failed: " . $e->getMessage()]);
            }
        }

        break;
        
    // --- PUT Requests (Update) ---
    case 'PUT':
        if ($route === 'appointments/status') {
            // Staff: Update Appointment Status (e.g., Cancelled, No-Show)
            $appointment_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($appointment_id === 0 || empty($input['status'])) {
                   http_response_code(400);
                   echo json_encode(array("message" => "Appointment ID and status are required for update."));
                   break;
            }
            
            $query = "UPDATE appointments SET status = :s WHERE appointment_id = :aid";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':s', $input['status']);
            $stmt->bindParam(':aid', $appointment_id, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                http_response_code(200);
                write_audit($pdo, $current_user_id, 'appointment_status_update', json_encode(['appointment_id' => $appointment_id, 'status' => $input['status']]));
                echo json_encode(array("message" => "Appointment status updated to " . $input['status']));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Unable to update appointment status."));
            }
        }
        
        else if ($route === 'patients/update') {
            // Staff: Patient Details Update Logic
            $patient_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
            if ($patient_id === 0 || empty($input['first_name']) || empty($input['birth_date'])) {
                http_response_code(400);
                echo json_encode(array("message" => "Patient ID and required fields are needed for update."));
                break;
            }

            $query = "UPDATE patients SET first_name = :fn, last_name = :ln, birth_date = :bd, gender = :g, contact_number = :cn, address = :a, hmo_id = :hmo, updated_at = NOW() WHERE patient_id = :pid";
            $stmt = $pdo->prepare($query);
            
            // FIX: Handle optional fields to ensure empty strings are stored as NULL
            $last_name = empty($input['last_name']) ? null : $input['last_name'];
            $gender = empty($input['gender']) ? null : $input['gender'];
            $contact_number = empty($input['contact_number']) ? null : $input['contact_number'];
            $address = empty($input['address']) ? null : $input['address'];
            $hmo_id = empty($input['hmo_id']) ? null : $input['hmo_id']; 

            $stmt->bindParam(':fn', $input['first_name']);
            $stmt->bindParam(':ln', $last_name);
            $stmt->bindParam(':bd', $input['birth_date']);
            $stmt->bindParam(':g', $gender);
            $stmt->bindParam(':cn', $contact_number);
            $stmt->bindParam(':a', $address);
            $stmt->bindParam(':hmo', $hmo_id);
            $stmt->bindParam(':pid', $patient_id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                http_response_code(200);
                    write_audit($pdo, $current_user_id, 'patient_update', json_encode(['patient_id' => $patient_id, 'first_name' => $input['first_name'], 'last_name' => $input['last_name']]));
                echo json_encode(array("message" => "Patient ID $patient_id updated successfully."));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Unable to update patient record."));
            }
        }
        
        break;

    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed."));
        break;
}
?>