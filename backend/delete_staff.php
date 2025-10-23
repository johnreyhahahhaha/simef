<?php
// project/clinic/backend/delete_staff.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

$conn = mysqli_connect("localhost", "root", "", "admins");
if (!$conn) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data["id"] ?? "";

if (empty($id)) {
    echo json_encode(["success" => false, "message" => "Missing staff ID"]);
    exit;
}

$sql = "DELETE FROM staff WHERE id=?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $id);

if (mysqli_stmt_execute($stmt)) {
    // audit
    $details = json_encode(["staff_id" => $id]);
    $aq = "INSERT INTO audit_log (user_id, action, details) VALUES (NULL, 'staff_delete', ?)";
    $ast = mysqli_prepare($conn, $aq);
    if ($ast) {
        mysqli_stmt_bind_param($ast, "s", $details);
        @mysqli_stmt_execute($ast);
        mysqli_stmt_close($ast);
    }

    echo json_encode(["success" => true, "message" => "Staff deleted successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Delete failed: " . mysqli_stmt_error($stmt)]);
}

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
