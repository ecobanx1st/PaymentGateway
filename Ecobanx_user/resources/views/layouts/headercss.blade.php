<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @if(isset($title))
    <title>{{ $title.' | '.'Eco Banx  | Crypto Payment Gateway' }}</title>
    @else
    <title>{{ config('app.name', 'Eco Banx  | Crypto Payment Gateway') }}</title>
    @endif
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
    <link rel="stylesheet" type="text/css" href="{{ url('css/style.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ url('css/custom.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="{{ url('css/owl.carousel.min.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ url('css/owl.theme.default.min.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <script src="{{ url('js/jquery.min.js') }}"></script>
    <script src="{{ url('js/owl.carousel.min.js') }}"></script>


    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('./img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('./img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('./img/favicon_io/favicon-16x16.png') }}">
</head>

<body>