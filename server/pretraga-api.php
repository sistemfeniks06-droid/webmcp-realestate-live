<?php
// DB Configuration - Use placeholders for security on GitHub
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

$akcija = isset($_GET['akcija']) ? trim($_GET['akcija']) : '';
$tip = isset($_GET['tip']) ? trim($_GET['tip']) : '';
$lokacija = isset($_GET['lokacija']) ? trim($_GET['lokacija']) : '';
$budzet_do = isset($_GET['budzet_do']) ? floatval($_GET['budzet_do']) : 0;

if (empty($akcija) || empty($tip)) {
    die(json_encode(["status" => "error", "message" => "Akcija i tip su obavezni parametri."], JSON_UNESCAPED_UNICODE));
}

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Problem sa konekcijom."], JSON_UNESCAPED_UNICODE));
}
$conn->set_charset("utf8mb4");

$sql = "SELECT id, ulica, cena, grad FROM nekretnine WHERE akcija = ? AND tip = ?";
$params = [$akcija, $tip];
$types = "ss";

if (!empty($lokacija)) {
    $sql .= " AND grad LIKE ?";
    $params[] = "%" . $lokacija . "%";
    $types .= "s";
}

if ($budzet_do > 0) {
    $sql .= " AND cena <= ?";
    $params[] = $budzet_do;
    $types .= "d";
}

$sql .= " LIMIT 3";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    die(json_encode(["status" => "error", "message" => "SQL greska u pripremi."], JSON_UNESCAPED_UNICODE));
}

$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$nekretnine = [];
while ($row = $result->fetch_assoc()) {
    // KLJUČNA PROMENA: Automatski dodaje tačan SEO URL do nekretnine
    $row['url'] = "https://www.feniks.rs/nekretnina/" . $row['id'];
    $nekretnine[] = $row;
}

if (empty($nekretnine)) {
    echo json_encode(["status" => "prazno", "message" => "Nema rezultata za zadate kriterijume."], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode($nekretnine, JSON_UNESCAPED_UNICODE);
}

$stmt->close();
$conn->close();
?>
