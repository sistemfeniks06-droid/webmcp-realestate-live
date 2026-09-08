<?php
// DB Configuration - Use placeholders for security on GitHub
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'your_database');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) { 
    die(json_encode(["error" => "Problem sa konekcijom"])); 
}
$conn->set_charset("utf8mb4");

// 1. GET Parameters
$akcija = $_GET['akcija'] ?? '';
$tip = $_GET['tip'] ?? '';
$lokacija = $_GET['lokacija'] ?? '';
$budzet_do = isset($_GET['budzet_do']) ? (float)$_GET['budzet_do'] : 0;

// 2. Dynamic Query Building
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

$sql .= " LIMIT 3"; // AI Context Optimization

// 3. Execution
$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

$nekretnine = [];
while ($row = $result->fetch_assoc()) { 
    $nekretnine[] = $row; 
}

// 4. Output
header('Content-Type: application/json');
if (empty($nekretnine)) { 
    echo json_encode(["status" => "prazno", "message" => "Nema rezultata za zadate kriterijume."]); 
} else { 
    echo json_encode($nekretnine); 
}

$stmt->close();
$conn->close();
?>
