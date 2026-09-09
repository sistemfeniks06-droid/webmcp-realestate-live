<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

$id = $_GET['id'] ?? '';
if (empty($id)) { die(json_encode(["error" => "Nedostaje ID"])); }

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
$conn->set_charset("utf8mb4");

$sql = "SELECT id, ulica, cena, grad, spratnost, grejanje, stanje, opis_rs FROM nekretnine WHERE id = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

header('Content-Type: application/json');
if ($row = $result->fetch_assoc()) { 
    // SECURITY PROTOCOL: Truncate description to 1000 characters for AI context budget
    if (mb_strlen($row['opis_rs']) > 1000) { 
        $row['opis_rs'] = mb_substr($row['opis_rs'], 0, 1000) . "... (description truncated for brevity)"; 
    }
    echo json_encode($row); 
} else { 
    echo json_encode(["status" => "error", "message" => "Nekretnina nije pronađena."]); 
}

$stmt->close();
$conn->close();
?>
