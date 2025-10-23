<?php
// project/clinic/backend/staff_api.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$conn = mysqli_connect('localhost','root','','admins');
if (!$conn) {
    die(json_encode(['success' => false, 'message' => 'Connection failed']));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $role     = $_POST['role'] ?? ''; // galing sa frontend dropdown

    if (empty($username) || empty($password) || empty($role)) {
        echo json_encode(['success' => false, 'message' => 'Please enter username, password, and role']);
        exit;
    }

    $stmt = $conn->prepare("SELECT * FROM staff WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // ✅ password check (sha256 or password_hash)
        $sha256_input = hash("sha256", $password);
        $validPassword = false;

        if ($user['password'] === $sha256_input) {
            $validPassword = true;
        } elseif (password_verify($password, $user['password'])) {
            $validPassword = true;
        }

        // ✅ position check (exact match)
        $validPosition = (strtolower($user['position']) === strtolower($role));

        if ($validPassword && $validPosition) {
            echo json_encode([
                'success' => true,
                'message' => ucfirst($user['position']) . ' login successful',
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'position' => $user['position']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid ' . $role . ' credentials']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'User not found']);
    }

    $stmt->close();
    $conn->close();
}
?>
