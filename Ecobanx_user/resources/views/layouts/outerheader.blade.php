<?php

if (isset($atitle)) {
    switch ($atitle) {
        case 'dashboard':
            $active = "dashboard";
            break;
        case 'buycrypto':
            $active = "buycrypto";
            break;
        case 'support coins':
            $active = "support coins";
            break;
        case 'merchant':
            $active = "merchant";
            break;
        case 'fees':
            $active = "fees";
            break;
    }
} else {
    $active = "";
}
?>


<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @if(isset($title))
    <title>{{ $title . ' - ' . 'Eco Banx  | Crypto Payment Gateway' }}</title>
    @else
    <title>{{ config('app.name', 'Eco Banx  | Crypto Payment Gateway') }}</title>
    @endif

    <!-- CSS stylesheet -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css"
        integrity="sha512-rd0qOHVMOcez6pLWPVFIv7EfSdGKLt+eafXh4RO/12Fgr41hDQxfGvoi1Vy55QIVcQEujUE1LQrATCLl2Fs+ag=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <link rel="stylesheet" type="text/css" href="{{ url('outerpage-assert/css/custom.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ url('outerpage-assert/css/style.css') }}">
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('./img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('./img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('./img/favicon_io/favicon-16x16.png') }}">

    <link rel="preload" href="{{ url('outerpage-assert/font/Clash-Display/ClashDisplay-Regular.otf') }}" as="font"
        type="font/otf" crossorigin>
    <style>
    @font-face {
        font-family: 'ClashDisplay, sans-serif';
        font-style: normal;
        src: url("../font/Clash-Display/ClashDisplay-Regular.otf");
        font-display: swap;
    }
    </style>

</head>

<body>

    <section class="header">
        <div class="contain-width">
            <nav class="navbar navbar-expand-lg header-nav">
                <a href="{{ url('/') }}" class="navbar-brand brand-logo">
                    <img src="{{ url('/outerpage-assert/image/Hashcodex-header-logo.png') }}" alt="" class="img-fluid"
                        width="50" height="45">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                    aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <i class="fa-solid fa-bars-staggered"></i>
                </button>
                <div class="collapse navbar-collapse header-collapse" id="navbarText">
                    <a href="#" class="close-menu"><i class="fa-solid fa-xmark"></i></a>
                    <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link wallet-link" aria-current="page" href="#">Eco
                                Banx </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link wallet-link @if ($active == 'support coins') active @endif"
                                href="{{ url('/supported-coins') }}">SUPPORTED COINS</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link wallet-link @if ($active == 'merchant') active @endif"
                                href="{{ url('/merchant-tool') }}">MERCHANT TOOLS</a>
                        </li>

                        <li class="nav-item dropdown head-dropdown">
                            <a class="nav-link wallet-link @if ($active == 'fees') active @endif"
                                href="{{ url('/fees') }}">FEES</a>
                            <!-- <a class="nav-link dropdown-toggle head-dropdown-toggle" href="{{ url('/') }}"
                                id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown"
                                aria-expanded="false">
                                FEES
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                                <li><a class="dropdown-item" href="{{ url('/') }}">Action</a></li>
                                <li><a class="dropdown-item" href="{{ url('/') }}">Another action</a></li>
                                <li><a class="dropdown-item" href="{{ url('/') }}">Something else here</a></li>
                            </ul> -->
                        </li>

                    </ul>
                    <div class="crypto-btns">
                        <ul class="last-menu-list">
                            <li><a href="{{ url('/login') }}" class="sign-in-btn header-btn">SIGN IN <i
                                        class="fa-solid fa-arrow-right"></i></a></li>
                            <li><a href="{{ url('/register') }}" class="sign-up-btn blue-btn header-btn">SIGN UP <i
                                        class="fa-solid fa-arrow-right" style="color: #ffffff;"> </i></a></li>

                            <!-- <li class="open"><a href="{{ route('userpanel') }}">Dashboard</a></li>
                                
                                <li class="dropdown">
                                    <button type="button" class="btn btn-primary dropdown-toggle"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        <span class="caret">
                                            <img src="{{ url('img/profile-Image.png') }}" alt="profile-Image"
                                                id="img-circle img-inline">
                                        </span> User <i class="fa-solid fa-angle-down"></i>
                                    </button>
                                   

                                    <ul class="dropdown-menu">
                                        <li><a href="{{ url('profile') }}">Profile</a></li>
                                        <li><a href="{{ url('kyc') }}">Kyc</a></li>
                                        <li>
                                            <a href="{{ route('logout') }}">
                                                Logout </a>
                                            <form id="logout-form" action="{{ route('logout') }}" method="POST"
                                                style="display: none;">
                                                {{ csrf_field() }}
                                            </form>
                                        </li>
                                    </ul>
                                </li> -->
                        </ul>
                    </div>
                </div>

            </nav>

    </section>