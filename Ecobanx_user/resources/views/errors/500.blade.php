<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>500 Page</title>
	<link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,900" rel="stylesheet">
	<link type="text/css" rel="stylesheet" href="{{ url('errors/css/style.css') }}" />
</head>
<body>
	<div id="notfound">
		<div class="notfound">
			<h2>500 - Error found</h2>
			<p>The page have some error.</p>
			<a href="{{ url('/') }}">Go To Homepage</a>
		</div>
	</div>
</body>
</html>