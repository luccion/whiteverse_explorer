<?
require_once('connect.php');
$sql = 'SELECT * FROM ' . STARS;
$results = $con->query($sql);
$all = array();
while ($row = $results->fetch_assoc()) {
    $all[] = $row;
}

$sql = 'SELECT * FROM ' . TYPES;
$results = $con->query($sql);
$allTypes = array();
while ($row = $results->fetch_assoc()) {
    $allTypes[] = $row;
}

$sql = 'SELECT * FROM ' . BUFFS;
$results = $con->query($sql);
$allBuffs = array();
while ($row = $results->fetch_assoc()) {
    $allBuffs[] = $row;
}
$sql = 'SELECT * FROM ' . FACTIONS;
$results = $con->query($sql);
$allFactions = array();
while ($row = $results->fetch_assoc()) {
    $allFactions[] = $row;
}
$sql = 'SELECT * FROM ' . REGIONS;
$results = $con->query($sql);
$allRegions = array();
while ($row = $results->fetch_assoc()) {
    $allRegions[] = $row;
}
$sql = 'SELECT starid1,starid2 FROM ' . ROUTES;
$results = $con->query($sql);
$allRoutes = array();
while ($row = $results->fetch_assoc()) {
    $allRoutes[] = $row;
}
$data = array();
$data[0] = $all;
$data[1] = $allTypes;
$data[2] = $allBuffs;
$data[3] = $allFactions;
$data[4] = $allRegions;
$data[5] = $allRoutes;

echo json_encode($data, JSON_UNESCAPED_UNICODE);
