<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title> 404 Page | {{ config('app.name') }}</title>
	<link href="https://fonts.googleapis.com/css?family=Montserrat:700,900" rel="stylesheet">
	<link type="text/css" rel="stylesheet" href="{{ url('adminpanel/css/404.css') }}" />

</head>
<style type="text/css">

</style>
<body>
	<div id="notfound">
		<div class="notfound">
			<div class="notfound-404">
				<h1>Oops!</h1>
			</div>
			<h2>404 - WE ARE SORRY, PAGE NOT FOUND!</h2>
			<p>The page you are looking for might have been removed had its name changed or is temporarily unavailable.</p>
			<a href="{{ url('/') }}">Go To Homepage</a>
		</div>
	</div>

</body>

</html>
