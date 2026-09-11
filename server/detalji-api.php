<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (empty($id)) {
    die(json_encode(["status" => "error", "message" => "Nedostaje ID nekretnine."], JSON_UNESCAPED_UNICODE));
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Problem sa konekcijom."], JSON_UNESCAPED_UNICODE));
}
$conn->set_charset("utf8mb4");

$sql = "SELECT id, ulica, cena, grad, spratnost, grejanje, stanje, opis_rs FROM nekretnine WHERE id = ? LIMIT 1";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode(["status" => "error", "message" => "SQL greska u pripremi."], JSON_UNESCAPED_UNICODE));
}

$stmt->bind_param("s", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    // Dodajemo direktan URL ka nekretnini
    $row['url'] = "https://www.feniks.rs/nekretnina/" . $row['id'];

    if (isset($row['opis_rs']) && mb_strlen($row['opis_rs']) > 1000) {
        $row['opis_rs'] = mb_substr($row['opis_rs'], 0, 1000) . "... (opis je skraćen radi preglednosti)";
    }

    echo json_encode($row, JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode(["status" => "error", "message" => "Nekretnina nije pronađena u bazi."], JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>
