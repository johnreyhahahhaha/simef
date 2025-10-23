<?php
// project/clinic/backend/update_staff.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

$conn = mysqli_connect("localhost", "root", "", "admins");
if (!$conn) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

$data = json_decode(file_get_contents("php://input"), true);

$id           = $data["id"] ?? "";
$username     = $data["username"] ?? "";
$full_name    = $data["full_name"] ?? "";
$email        = $data["email"] ?? "";
$phone        = $data["phone"] ?? "";
$address      = $data["address"] ?? "";
$position     = $data["position"] ?? "";
$date_of_birth= $data["date_of_birth"] ?? "";

if (empty($id) || empty($username) || empty($full_name) || empty($position)) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

$sql = "UPDATE staff 
        SET username=?, full_name=?, email=?, phone=?, address=?, position=?, date_of_birth=? 
        WHERE id=?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "sssssssi", $username, $full_name, $email, $phone, $address, $position, $date_of_birth, $id);

if (mysqli_stmt_execute($stmt)) {
    // write audit log
    $details = json_encode(["staff_id" => $id, "full_name" => $full_name, "username" => $username, "position" => $position]);
    $aq = "INSERT INTO audit_log (user_id, action, details) VALUES (NULL, 'staff_update', ?)";
    $ast = mysqli_prepare($conn, $aq);
    if ($ast) {
        mysqli_stmt_bind_param($ast, "s", $details);
        @mysqli_stmt_execute($ast);
        mysqli_stmt_close($ast);
    }

    echo json_encode(["success" => true, "message" => "Staff updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed: " . mysqli_stmt_error($stmt)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
