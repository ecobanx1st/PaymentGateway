<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @if(isset($title))
    <title>{{ $title.' | '.'Eco Banx  | Crypto Payment Gateway' }}</title>
    @else
    <title>{{ config('app.name', 'Eco Banx  | Crypto Payment Gateway') }}</title>
    @endif
    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('./img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('./img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('./img/favicon_io/favicon-16x16.png') }}">

    <link href="{{ url('css/bootstrap.min.css') }}" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Muli:200,300,400,700&display=swap" rel="stylesheet">
    <link href="{{ url('font-awesome/6.4.0/css/font-awesome.min.css') }}" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="{{ url('css/payment-style.css') }}" type="text/css" />
</head>

<body>
    @yield('content')
    <script src="{{ url('public/js/jquery.min.js') }}"></script>
    <script src="{{ url('public/js/bootstrap.min.js') }}"></script>
</body>

</html>