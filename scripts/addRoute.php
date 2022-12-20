<?
require_once('connect.php');
$starid1 = (int)$_POST['s1'];
$starid2 = (int)$_POST['s2'];

$sql = 'INSERT INTO ' . ROUTES . ' (`starid1`,`starid2`) VALUES (' . $starid1 . ',' . $starid2 . ')';
if ($con->query($sql)) {
    $log = "route added " . "by " . $user . ", " . "{" . $starid1 . '---' . $starid2 . "}";
    write($log);
    exit("success");
}
