<?php
if (!isset($active)) {
    $active = 'Home';
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
    <title>{{ $title . ' | ' . 'Eco Banx  | Crypto Payment Gateway' }}</title>
    @else
    <title>Eco Banx | Crypto Payment Gateway</title>
    @endif
    <!-- <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet"> -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="{{ url('css/custom-new.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ url('css/payment.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('/img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('/img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('/img/favicon_io/favicon-16x16.png') }}">

</head>

<body>

    <section class="header">
        <div class="contain-width">
            <nav class="navbar navbar-expand-xl navbar-light">
                <div class="container-fluid">
                    <a class="navbar-brand" href="{{url('/')}}"><img src="{{ url('img/logo.png') }}" alt="logo"></a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapsibleNavbar">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="collapsibleNavbar">
                        <a href="#" class="close-menu"><i class="fa-solid fa-xmark"></i></a>
                        <div class="center-menu">
                            <ul class="navbar-nav">
                                <li class="nav-item">
                                    <a class="nav-link <?php if ($active == 'Home') {
    echo 'active';
} ?>" href="{{url('/')}}">Home</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="3">Buy
                                        Crypto</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{url('/supported-coins')}}">Supported Coins</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{url('/merchant-tool')}}">Merchant Tool</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{url('/fees')}}">Fees</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="{{url('/aboutus')}}">About Us</a>
                                </li>
                            </ul>
                        </div>

                        <div class="right-menu">
                            <ul class="last-menu-list">
                                <!-- <li><select><option value="en">EN</option><option value="fr">FR</option></select></li> -->
                                @guest
                                <li><a href="{{ route('login') }}">Login</a></li>
                                <li class="last-menu"><a href="{{ route('register') }}"><span>Register</span></a></li>
                                @else
                                <li class="open"><a href="{{ route('userpanel') }}">Dashboard</a></li>
                                <li><a href="{{ route('wallet') }}">My Wallet</a></li>
                                <li class="profile dropdown">
                                    <button type="button" class="btn btn-primary dropdown-toggle"
                                        data-bs-toggle="dropdown">Merchant
                                        Account <i class="fa-solid fa-angle-down"></i> </button>
                                    <!-- <a href="#" data-toggle="dropdown" class="toggle tf">Merchant Account<i class="fa fa-angle-down"></i></a> -->
                                    <ul class="dropdown-menu profile">
                                        <li><a href="{{ route('merchanttools') }}">Merchant Tools</a></li>
                                        <li><a href="{{ route('basicsetting') }}">Account Setting</a></li>
                                        <li><a href="{{ route('apikeylist') }}">API Keys</a></li>
                                        <li><a href="{{ route('ipnhistroy') }}">IPN History</a></li>
                                        <li><a href="{{ url('tickets/list') }}">Support / Contact</a></li>
                                    </ul>
                                </li>
                                <li class="dropdown">
                                    <button type="button" class="btn btn-primary dropdown-toggle"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        <span class="caret">
                                            @if(Auth::user()->profileimg != "")
                                            <img src="{{ Auth::user()->profileimg }}" alt="profile-Image"
                                                id="img-circle img-inline">
                                            @else
                                            <img src="{{ url('img/profile-Image.png') }}" alt="profile-Image"
                                                id="img-circle img-inline">
                                            @endif
                                            <!-- <img src="img/profile-pic.png" alt="profile" class="img-circle img-inline"> !-->
                                        </span> {{ Auth::user()->name }} <i class="fa-solid fa-angle-down"></i>
                                    </button>
                                    <!-- <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false" aria-haspopup="true" v-pre>
                                                {{ Auth::user()->name }} 
                                                </a> -->

                                    <ul class="dropdown-menu">
                                        <li><a href="{{ url('profile') }}">Profile</a></li>
                                        <li><a href="{{ url('kyc') }}">Kyc</a></li>
                                        <li>
                                            <a href="{{ route('logout') }}"
                                                onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                                Logout </a>
                                            <form id="logout-form" action="{{ route('logout') }}" method="POST"
                                                style="display: none;">
                                                {{ csrf_field() }}
                                            </form>
                                        </li>
                                    </ul>
                                </li>
                                @endguest
                            </ul>
                        </div>
                    </div>



                </div>
            </nav>
        </div>
    </section>


    <section class="banner-part">
        <div class="contain-width">
            <div class="row">

                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <h1>THE BEST <span>CRYPTO PAYMENT</span> FOR BUSINESS</h1>
                    <h3>Supports 30+ cryptoand 20+ fiat currencies</h3>
                    <p>The perfect solution for cryptocurrency settlementsbetween business partners. Cheap, fast, and
                        secure.</p>
                    <div class="banner-button"><a href="#"><span>Get the App</span></a></div>
                </div>

                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="banner-right">
                        <img src="{{ url('img/foot-right-img.svg') }}" alt="home-top-image" class="img-fluid">
                    </div>
                </div>

            </div>
        </div>
    </section>


    <section class="banner-partner-intermediate">
        <div class="banner-partner-intermediate-img">
            <img src="img/banner-partner-intermediate.png" alt="banner-partner-intermediate">
        </div>
    </section>


    <section class="partner-part">
        <!-- <div class="partner"><img src="img/partner.png"></div> -->
        <div class="contain-width">
            <div class="row">

                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="partner-left-part">
                        <h2>The partner you can trust</h2>
                        <p>The №1 solution in crypto processing.</p>
                        <div class="logo-button"><img src="{{ url('img/logo-partner.png') }}"></div>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <ul class="partners-list">
                        <li><strong>9+</strong><span> YEARS Of cryptocurrency expertise</span></li>
                        <li><strong>ZERO</strong><span> Lost funds of our clients</span></li>
                        <li><strong>8%</strong><span> Of all on-chain Bitcoin transactions</span></li>
                        <li><strong>OVER 800</strong><span> Satisfied customers in various industries</span></li>
                        <li><strong>OVER 34M</strong> <span>Transactions processed</strong></li>
                        <li><strong>OVER 19B</strong><span> Euro processed in crypto</span></li>
                        <li><strong>OVER 160</strong><span> Team members in 15 countries</span></li>
                    </ul>
                </div>

            </div>
        </div>
    </section>




    <!-- <section class="joinng-team">
 <div class="contain-width">
  <div class="row">

     <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12">
      <p>Join the winning team today to become the leader tomorrow</p>
     </div>

      <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12">
        <div class="joining-button"><a href="#">Get a free consultion</a></div>
      </div>

  </div>
</div> 
</section> -->


    <section class="killer-feature">
        <div class="contain-width">
            <h2 class="killer-feature-head">Killer <span>feature</span> for settlements with <span>partners</span></h2>
            <p class="killer-feature-para">Our business crypto wallet is intuitively easy to use for recieving, storing,
                exchanging and sending payments in 30+ crypto and 20+ fiat currencies. It is the best solution for
                affiliate
                programs, traffic exchanges, IT developers, marketing services, payment providers, real estate agencies,
                financial institutions and a lot more.
            </p>

            <div class="row">

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-1.png') }}" alt="kf-1"></span>
                        <h4>0 Volatility risk</h4>
                        <p>You can hold 20+ fiat currencies on your balance and just convert them into crypto when do a
                            payment.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-2.png') }}" alt="kf-2"></span>
                        <h4>Global coverage</h4>
                        <p>Cryptocurrency is borderless, you can pay your partners in crypto everywhere in the world.
                        </p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-3.png') }}" alt="kf-3"></span>
                        <h4>Transparent fees</h4>
                        <p>We charge only a flat fee on processing or exchange transactions, with no markups on exchange
                            rates.
                            Also, you can get up to a 50% discount with our loyalty program.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-4.png') }}" alt="kf-4"></span>
                        <h4>Fast onboarding</h4>
                        <p>Our in-house compliance department conducts KYB and opens an account shortly.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-5.png') }}" alt="kf-5"></span>
                        <h4>Accounting documents</h4>
                        <p>You can get any required accounting documentation on every operation you deal with.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <span class="icon-kf"><img src="{{ url('img/kf-6.png') }}" alt="kf-6"></span>
                        <h4>Swift & sepa supported</h4>
                        <p>You can top-up your account in SWIFT and SEPA and buy crypto for your needs, or, you can
                            withdraw fiat
                            directly to your bank account.</p>
                    </div>
                </div>

            </div>
        </div>
    </section>



    <section class="cc-feature">
        <div class="contain-width">
            <div class="row">

                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <h2 class="killer-feature-head cc-feature-head">We got all crypto currency <span>features</span>
                    </h2>
                    <div class="cc-feature-list">
                        <div class="cc-tick"><img src="{{ url('img/cc-tick.png') }}" alt="cc-tick-img"></div>
                        <div class="cc-list-content"><strong>PAY IN CRYPTO</strong> — Instantly pay your partners with
                            any crypto of
                            your choice with a low mining fee.</div>
                    </div>
                    <div class="cc-feature-list">
                        <div class="cc-tick"><img src="{{ url('img/cc-tick.png') }}" alt="cc-tick-img"></div>
                        <div class="cc-list-content"><strong>BUY CRYPTO WITH FIAT</strong> — Top up your account with
                            fiat and buy
                            crypto for your needs with our built-in exchange or OTC desk.</div>
                    </div>
                    <div class="cc-feature-list">
                        <div class="cc-tick"><img src="{{ url('img/cc-tick.png') }}" alt="cc-tick-img"></div>
                        <div class="cc-list-content"><strong>INVOICE WITH CRYPTO</strong> — Bill your partners in crypto
                            with
                            invoice and payment link options, and receive the equivalent amount in fiat on your account.
                        </div>
                    </div>
                    <div class="cc-feature-list">
                        <div class="cc-tick"><img src="{{ url('img/cc-tick.png') }}" alt="cc-tick-img"></div>
                        <div class="cc-list-content"><strong>DO MASS PAYOUTS</strong> — Make different crypto payouts on
                            multiple
                            addresses from one single wallet by simply uploading a balance sheet.</div>
                    </div>
                </div>

                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="cc-feature-img">
                        <img src="{{ url('img/cc-features.svg') }}" alt="cc-features-img">
                    </div>
                </div>

            </div>
        </div>
    </section>




    <section class="killer-feature key-benefits-pyment">
        <div class="contain-width">
            <h2 class="killer-feature-head">key benefits of our <span>leading payment</span> solutions</h2>
            <p class="killer-feature-para">Cryptoprocessing by coinspaid satisfies 99% of yourbusiness & your customers
                needs.
            </p>

            <div class="key-benefit-new-img">
                <div class="key-benefit-1"><img src="{{ url('img/key-benefit-1.svg') }}"></div>
                <div class="key-benefit-2"><img src="{{ url('img/key-benefit-2.png') }}"></div>
            </div>

            <div class="row key-benefits-row">

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-1.svg') }}"></div>
                        <h4>Simple integration</h4>
                        <p>We offer one of the best APIs on the market with full integration support via a dedicated
                            manager.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-2.svg') }}"></div>
                        <h4>Instant transactions</h4>
                        <p>We support instant transaction confirmation for the most popular cryptocurrencies, even
                            before they are
                            confirmed by blockchain.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-3.svg') }}"></div>
                        <h4>Treasury management</h4>
                        <p>Multi-level wallet system which allows sending funds from hot wallet to external one or cold
                            storage
                            automatically based on set thresholds by merchants.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-4.svg') }}"></div>
                        <h4>Innovative liquidity aggregator</h4>
                        <p>Our liquidity aggregator has integration with all the leading exchanges and liquidity
                            providers giving
                            you the best exchange rates and minimum slippage on any</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-5.svg') }}"></div>
                        <h4>Loyalty program discounts</h4>
                        <p>Get up to a 50% discount on all transactions by using our own utility token. Contact sales
                            team to learn
                            more.</p>
                    </div>
                </div>

                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="inner-killer-feature">
                        <div class="kb-img"><img src="{{ url('img/kb-6.svg') }}"></div>
                        <h4>Swift & sepa supported</h4>
                        <p>Only transparent pricing with no hidden fees and zero markups on exchange rates.</p>
                    </div>
                </div>

            </div>
        </div>
    </section>





    <section class="start-your-journey">
        <div class="start-your-journey-inner">

            <div class="contain-width start-your-journey-contain">

                <h2 class="killer-feature-head">Start your journey with crypto today!</h2>
                <p class="killer-feature-para">Leave the request nowand your personal manager willcontact you in 5
                    minutes via
                    email.</p>
                <div class="start-your-journey-buttons">
                    <button><span>Request Now</span></button>
                    <button><span>Other Questions</span></button>
                </div>
                <span>*choose the “Other questions” option if you don’t need a sales manager, but a support team</span>
            </div>

        </div>

    </section>


    <section class="join-the-winning-team">
        <div class="join-the-winning-team-inner">

            <div class="contain-width">

                <div class="row">

                    <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                        <div class="join-the-winning-team-img"><img src="{{ url('img/business-growth.svg') }}"
                                alt="business-growth"></div>
                    </div>

                    <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                        <div class="join-win-team-block">
                            <h2>Join the winning team today</h2>
                            <div class="gpay-android">
                                <div><img src="{{ url('img/googleplay.png') }}" alt="googleplay"></div>
                                <div><img src="{{ url('img/appstore.png') }}" alt="appstore"></div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row">

                    <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                        <div class="img-client"><img src=""></div>
                    </div>

                    <div class="col-xl-8 col-lg-8 col-md-12 col-sm-12">

                    </div>

                </div>

            </div>

        </div>
    </section>


    <section class="faq-sectn" id="tech-modern">
        <div class="contain-width">
            <h3>FAQs</h3>
            <div class="faq-cls-sectns">
                <div class="perks-benfits">

                    <div class="block-1 coloured">
                        <div class="accrd-panel-head active">
                            <h4>
                                <span class="align-self-center">What is a crypto payment gateway?</span>
                            </h4>
                            <span class="mp-icon"><i class="fa-sharp fa-solid fa-chevron-right"></i></span>
                        </div>
                        <div class="accrd-panel-body active">
                            <p>A crypto payment gateway is a service that allows online and offline merchants to receive
                                payments in
                                cryptocurrency. The crypto funds sent by users to pay for goods and services are
                                credited to the
                                merchant’s account with the gateway provider. </p>
                        </div>
                    </div>

                    <div class="block-1">
                        <div class="accrd-panel-head">
                            <h4>
                                <span class="align-self-center">How do you set up a crypto payment gateway?</span>
                            </h4>
                            <span class="mp-icon"><i class="fa-sharp fa-solid fa-chevron-right"></i></span>
                        </div>
                        <div class="accrd-panel-body">
                            <p>A crypto payment gateway is a service that allows online and offline merchants to receive
                                payments in
                                cryptocurrency. The crypto funds sent by users to pay for goods and services are
                                credited to the
                                merchant’s account with the gateway provider. </p>
                        </div>
                    </div>

                    <div class="block-1">
                        <div class="accrd-panel-head">
                            <h4>
                                <span class="align-self-center">How do i create a crypto payment gateway?</span>
                            </h4>
                            <span class="mp-icon"><i class="fa-sharp fa-solid fa-chevron-right"></i></span>
                        </div>
                        <div class="accrd-panel-body">
                            <p>A crypto payment gateway is a service that allows online and offline merchants to receive
                                payments in
                                cryptocurrency. The crypto funds sent by users to pay for goods and services are
                                credited to the
                                merchant’s account with the gateway provider. </p>
                        </div>
                    </div>

                    <div class="block-1">
                        <div class="accrd-panel-head">
                            <h4>
                                <span class="align-self-center">What is a fiat-to-crypto payment gateway?</span>
                            </h4>
                            <span class="mp-icon"><i class="fa-sharp fa-solid fa-chevron-right"></i></span>
                        </div>
                        <div class="accrd-panel-body">
                            <p>A crypto payment gateway is a service that allows online and offline merchants to receive
                                payments in
                                cryptocurrency. The crypto funds sent by users to pay for goods and services are
                                credited to the
                                merchant’s account with the gateway provider. </p>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </section>



    <section class="footer">

        <div class="contain-width">

            <div class="row">
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="foot-logo"><img src="{{ url('img/logo.png') }}" alt="logo"></div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12 follow-us-foot">
                    <div class="follow-us-foot-inner">
                        <h5>Follow Us</h5>
                        <div class="social-icons">
                            <div class="foot-icons"><img src="{{ url('img/facebook-foot.svg') }}" alt="facebook-foot">
                            </div>
                            <div class="foot-icons"><img src="{{ url('img/linked-foot.svg') }}" alt="linked-foot"></div>
                            <div class="foot-icons"><img src="{{ url('img/ins-foot.svg') }}" alt="ins-foot"></div>
                            <div class="foot-icons"><img src="{{ url('img/twitter-foot.svg') }}" alt="twitter-foot">
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="row">

                <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">

                    <div class="row">

                        <div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 padding-75px">

                            <h5 style="margin-bottom: 20px;">Contact Us</h5>
                            <p>
                                <span>© 2023 Cryptoprocessing.com</span>
                                <span>Dream Finance OU</span>
                                <span>Address: Harju maakond, Tallinn,</span>
                                <span>Kesklinna linnaosa, Kai tn 4</span>
                                <span>10111, Tallinn, Estonia</span>
                                <span>VAT: EE102212301;</span>
                                <span>License No: FVT000166.</span>
                            </p>
                        </div>


                        <div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 padding-75px">
                            <h5>General</h5>
                            <ul class="foot-list">
                                <li><a href="#">About us</a></li>
                                <li><a href="#">Business Wallet</a></li>
                                <li><a href="#">OTC & Exchange</a></li>
                                <li><a href="#">Blog</a></li>
                                <li><a href="{{url('/help-center')}}">Help Center</a></li>
                            </ul>
                        </div>

                        <div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 padding-75px">
                            <h5>Documentation</h5>
                            <ul class="foot-list">
                                <li><a href="#">FAQ</a></li>
                                <li><a href="#">AML Policy</a></li>
                                <li><a href="#">Terms and Conditions</a>
                                </li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Documentation</a></li>
                            </ul>
                        </div>


                        <div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 padding-75px">
                            <h5>Public relations</h5>
                            <ul class="foot-list">
                                <li><a href="#">Contacts</a></li>
                                <li><a href="#">Our partners</a></li>
                            </ul>
                        </div>

                        <!-- <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
           <p class="foot-para-bottom">Data and information on this website are provided for informational purposes only, and are not intended for reference or other purposes. All financial, statistical and other relevant data regarding the clients/merchants, conducted transactions, etc., has been provided as aggregate from activities of all legal entities operating under the brand name of Coinspaid and Cryptoprocessing, including, but not limited to: (I) Dream Finance OÜ, Harju maakond, Tallinn, Kesklinna linnaosa, Kai tn 4, 10111, Estonia; (II) Dream Finance UAB, Gynejq St. 14-65, Vilnius, Lithuania and (III) Dream Finance S.A. DE C.V., 3A Calle Poniente Y, 71 Avenida Norte, Colonia Escalón, office No 3698, San Salvador, El Salvador.</p>
         </div> !-->

                    </div>

                </div>

                <!-- <div class="col-xl-4 col-lg-4 col-md-12 col-sm-12">
           <div class="foot-right-img"><img src="img/foot-right-img.png" alt="foot-right-img"></div>
         </div> -->



            </div>


        </div>

    </section>


    <!-- <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script> -->

    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
        integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous">
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
        integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous">
    </script>

    <script src="https://code.jquery.com/jquery-3.6.4.min.js"
        integrity="sha256-oP6HI9z1XaZNBrJURtCoUT5SUnxFr8s3BzRl+cbzUq8=" crossorigin="anonymous"></script>
    <script>
    $(document).ready(function() {

        $('.accrd-panel-head').click(function() {

            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
                $(this).siblings('.accrd-panel-body').slideUp(200);
                $(this).parent('.block-1').removeClass('coloured');
            } else {
                $('.accrd-panel-head').removeClass('active');
                $(this).addClass('active');
                $('.accrd-panel-head').siblings('.accrd-panel-body').slideUp(200);
                $(this).siblings('.accrd-panel-body').slideDown(200);
                $('.accrd-panel-head').parent('.block-1').removeClass('coloured');
                $(this).parent('.block-1').addClass('coloured');
            }

        });

    });
    </script>

    <script>
    $('a.close-menu').click(function() {

        $(this).parent('.collapse').removeClass('show');

    });
    </script>
    <script>
    $(document).ready(function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 100) { // Change 100 to the height you want to trigger the effect
                $('section.header').addClass('is-sticky');
            } else {
                $('section.header').removeClass('is-sticky');
            }
        });
    });
    </script>


</body>

</html>