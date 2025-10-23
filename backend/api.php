<?php
//project/clinic/backend/api.php/sa admin to
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = mysqli_connect('localhost','root','','admins');

if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Connection failed']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Please enter username and password']);
        exit;
    }

    $password_hashed = hash('sha256', $password);

    $stmt = $conn->prepare("SELECT * FROM admin WHERE username=? AND password=?");
    $stmt->bind_param("ss", $username, $password_hashed);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Login successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }

    $stmt->close();
    $conn->close();
}
?>
