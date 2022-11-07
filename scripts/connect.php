<?
$servername = "localhost";
$username = "whiteverse";
$password = "whiteverse";
$dbname = "whiteverse";
$con = mysqli_connect($servername, $username, $password);
if (!$con) {
    die('Could not connect: ');
}
mysqli_select_db($con, $dbname);
mysqli_query($con, 'set names utf8');

define('STARS', 'wv_celescial');
define('TYPES', 'wv_celescial_type');
define('BUFFS', 'wv_celescial_buff');
define('FACTIONS', 'wv_faction');
define('REGIONS', 'wv_region');
define('ROUTES', 'wv_celescial_route');
