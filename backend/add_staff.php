<?php
// project/clinic/backend/add_staff.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

$conn = mysqli_connect("localhost", "root", "", "admins");
if (!$conn) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid or empty JSON",
        "raw" => $raw
    ]);
    exit;
}

$username      = $data["username"]      ?? "";
$full_name     = $data["full_name"]     ?? "";
$email         = $data["email"]         ?? "";
$phone         = $data["phone"]         ?? "";
$address       = $data["address"]       ?? "";
$position      = $data["position"]      ?? "";
$password      = $data["password"]      ?? "";
$date_of_birth = $data["date_of_birth"] ?? "";
$gender        = $data["gender"]        ?? "";

if (empty($username) || empty($full_name) || empty($position) || empty($password) || empty($gender)) {
    echo json_encode(["success" => false, "message" => "Please fill all required fields"]);
    exit;
}

// ✅ Hash password using SHA256
$hashedPassword = hash("sha256", $password);

$sql = "INSERT INTO staff (username, full_name, email, phone, address, position, password, date_of_birth, gender) 
        VALUES (?,?,?,?,?,?,?,?,?)";
$stmt = mysqli_prepare($conn, $sql);

if ($stmt === false) {
    die(json_encode(["success" => false, "message" => "Failed to prepare statement: " . mysqli_error($conn)]));
}

mysqli_stmt_bind_param($stmt, "sssssssss", $username, $full_name, $email, $phone, $address, $position, $hashedPassword, $date_of_birth, $gender);

if (mysqli_stmt_execute($stmt)) {
    $new_id = mysqli_insert_id($conn);
    // write audit log (user_id is NULL here because this script does not have session info)
    $details = json_encode(["staff_id" => $new_id, "full_name" => $full_name, "username" => $username, "position" => $position]);
    $aq = "INSERT INTO audit_log (user_id, action, details) VALUES (NULL, 'staff_create', ?)";
    $ast = mysqli_prepare($conn, $aq);
    if ($ast) {
        mysqli_stmt_bind_param($ast, "s", $details);
        @mysqli_stmt_execute($ast);
        mysqli_stmt_close($ast);
    }

    echo json_encode(["success" => true, "message" => "Staff added successfully", "id" => $new_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add staff: " . mysqli_stmt_error($stmt)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
