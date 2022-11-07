<?
require_once('connect.php');
$starid1 = (int)$_POST['s1'];
$starid2 = (int)$_POST['s2'];

$sql = 'INSERT INTO ' . ROUTES . ' (`starid1`,`starid2`) VALUES (' . $starid1 . ',' . $starid2 . ')';
$con->query($sql);

echo "success";
