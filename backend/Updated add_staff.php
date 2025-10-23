<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = mysqli_connect("localhost", "root", "", "admins");
if (!$conn) {
    die(json_encode(["success" => false, "message" => "Connection failed."]));
}

$username = $_POST['username'] ?? '';
$full_name = $_POST['full_name'] ?? '';
$email = $_POST['email'] ?? 'N/A';
$phone = $_POST['phone'] ?? 'N/A';
$address = $_POST['address'] ?? 'N/A';
$position = $_POST['position'] ?? '';
$password = $_POST['password'] ?? '';

// Validation: dapat may laman ang full_name at position
if (empty($full_name) || empty($position)) {
    echo json_encode(["success" => false, "message" => "Full Name and Position are required."]);
    exit;
}

// Hash password with SHA256
$hashed_password = hash("sha256", $password);

// Insert data
$sql = "INSERT INTO staff (username, full_name, email, phone, address, position, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $username, $full_name, $email, $phone, $address, $position, $hashed_password);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Staff added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error adding staff"]);
}
