<?php
// project/clinic/backend/get_staff.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = mysqli_connect("localhost", "root", "", "admins");

if (!$conn) {
    die(json_encode(["success" => false, "message" => "Connection failed"]));
}

// Kunin lahat ng columns
$sql = "SHOW COLUMNS FROM staff";
$result = mysqli_query($conn, $sql);

$columns = [];
while ($row = mysqli_fetch_assoc($result)) {
    if ($row["Field"] !== "password") { 
        $columns[] = $row["Field"];
    }
}

// Buoin query (lahat maliban password)
$colList = implode(",", $columns);
$sql2 = "SELECT $colList FROM staff";
$result2 = mysqli_query($conn, $sql2);

$staff = [];
while ($row = mysqli_fetch_assoc($result2)) {
    $staff[] = $row;
}

echo json_encode([
    "success" => true,
    "staff" => $staff
]);
?>
