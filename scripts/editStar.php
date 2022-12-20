<?
require_once('connect.php');

$starid = (int)$_POST['id'];
$img = $_POST['img'];
$type = (int) $_POST['type'];
$coordX = (int)$_POST['coordX'];
$coordY = (int)$_POST['coordY'];
$name_en = htmlspecialchars($_POST['name_en'], ENT_QUOTES);
$name_cn = htmlspecialchars($_POST['name_cn'], ENT_QUOTES);
$name_tn = htmlspecialchars($_POST['name_tn'], ENT_QUOTES);
$description_cn = htmlspecialchars($_POST['description_cn'], ENT_QUOTES);
$description_tn = htmlspecialchars($_POST['description_tn'], ENT_QUOTES);
$description_en = htmlspecialchars($_POST['description_en'], ENT_QUOTES);
$buff = $_POST['buff'];
$faction = (int)$_POST['faction'];
$region = (int)$_POST['region'];

$edited = ["id" => $starid, "x" => $coordX, "y" => $coordY, "name_en" =>  $name_en, "name_cn" => $name_cn, "name_tn" =>  $name_tn, "description_en" =>  $description_en, "description_cn" => $description_cn, "description_tn" => $description_tn, "img" => $img, "type" =>  $type, "faction_id" =>  $faction, "buff" => $buff, "region_id" => $region];
$sql = 'SELECT * FROM ' . STARS . ' WHERE id=' . $starid;
$results = $con->query($sql);
$origin = $results->fetch_assoc();
unset($origin['color'], $origin['area'], $origin['npc_id'], $origin['edited'], $origin['special'], $origin['onsale']);
$diff = array_diff_assoc($edited, $origin);
if ($diff) {
    $sql = 'UPDATE ' . STARS . ' SET `x`=' . $coordX . ',`y`=' . $coordY . ',`name_en`=\'' . $name_en . '\',`name_cn`=\'' . $name_cn . '\',`name_tn`=\'' . $name_tn . '\',`description_cn`=\'' . $description_cn . '\',`description_en`=\'' . $description_en . '\',`description_tn`=\'' . $description_tn . '\',`img`=\'' . $img . '\',`type`=' . $type . ',`buff`=\'' . $buff . '\',`faction_id`=' . $faction . ',`region_id`=' . $region . ',edited= edited+1 WHERE id=' . $starid;
    if ($con->query($sql)) {
        $difflog = "";
        foreach ($diff as $key => $value) {
            $difflog .= $key . ":[" . $origin[$key] . "]" . "->[" . $value . "],";
        }
        $user = $_COOKIE['whiteverse_wiki_wkUserName'] ?: "ANONYMOUS";
        $log = "edited " . "by " . $user . ", " .  $name_cn . ' (' . $starid . ') {' . $difflog . "}";
        write($log);
        exit("success");
    };
} else {
    exit("nochange");
}
