@php $title = "Helpcenter";
$atitle = "helpcenter";
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- CSRF Token -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- @if(isset($title))
    <title>{{ $title . ' | ' . 'Eco Banx  | Crypto Payment Gateway' }}</title>
    @else
    <title>Eco Banx  | Crypto Payment Gateway</title>
    @endif -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
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

<body class="Hashcodex-helpCenter">
    @include('layouts.headercss')
    <section class="Dashboard-page">
        <div class="container-fluid">
            <div class="row">
                @include('layouts.menu')
                <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

                    <div class="header-part-outer sticky">

                        <div class="head-title-part">
                            <h1>Help Center</h1>
                        </div>

                    </div>
                    <div class="help-center-scroll">

                        <div class="lp-element process odd">
                            <div class="step-by-step process">
                                <div class="left step-by-step right step-con">
                                    <div class="step-by-step-img"><img src="{{ url('img/step-1.svg') }}" alt="logo">
                                    </div>
                                    <h2 class="create">Create Your Account</h2>
                                </div>

                                <div class="right step-con">
                                    <h2 class="create">Create Your Account</h2>
                                    <p class="account-info">Already have an account? Skip ahead to <strong>Step
                                            2</strong>
                                    </p>

                                    <ul>
                                        <li>Sign up for a Eco Banx account <a href="{{ url('register') }}">here</a>
                                        </li>
                                        <li>After signing up, verify your account by clicking the activation link in the
                                            email
                                            sent to the email address you used to register your account.</li>
                                        <li>Make sure your Two-Factor Authentication (2FA) has been turned on.</li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        <div class="lp-element process even">
                            <div class="step-by-step process">
                                <div class="left step-by-step right step-con">
                                    <div class="step-by-step-img"><img src="{{ url('img/step-2.svg') }}" alt="logo">
                                    </div>
                                    <h2>Get Your API Keys</h2>
                                </div>

                                <div class="right step-con">
                                    <h2>Get Your API Keys</h2>

                                    <ul>
                                        <li>When you are logged in to your account, in the "<span>ACCOUNT > ACCOUNT
                                                SETTINGS</span>" tab, you will find your Merchant ID.</li>
                                        <li>In the "<span>MERCHANT SETTINGS</span>" tab, set your IPN Secret.</li>
                                        <li>In the "<span>ACCOUNT > COIN ACCEPTANCE SETTINGS</span>" select which coins
                                            you
                                            want
                                            to accept as payment by selecting the dropdown box in front of each coin and
                                            click
                                            "<span>Update Coin Preferences</span>".</li>
                                        <li>Go to "<span>ACCOUNT > API KEYS</span>" and generate a new key by clicking
                                            the
                                            "<span>GENERATE NEW KEY</span>" button. You'll have your API Public Key and
                                            API
                                            Private Key.</li>
                                    </ul>
                                </div>

                            </div>
                        </div>


                        <div class="lp-element process odd">
                            <div class="step-by-step process">
                                <div class="left step-by-step right step-con">
                                    <div class="step-by-step-img"><img src="{{ url('img/step-3.svg') }}" alt="logo">
                                    </div>
                                    <h2>Set Up Crypto Payments</h2>
                                </div>

                                <div class="right step-con">
                                    <h2>Set Up Crypto Payments</h2>
                                    <p class="testing-info">Depending on how much automation you’re looking for and what
                                        type of
                                        platform you use to conduct your business activity, Eco Banx can be integrated
                                        via:
                                    </p>

                                    <ul>
                                        <li>
                                            <p>Pre-Built Ecommerce Plugins</p>
                                            Download the plugin that corresponds to your Ecommerce platform, install it
                                            and
                                            update the settings. Enter your MERCHANT ID and your IPN SECRET into the
                                            plugin
                                            settings to complete the integration. Note for Shopify users: just follow
                                            the
                                            prompts to login to your store and enable payments via Eco Banx .
                                        </li>
                                        <li>
                                            <p>Custom APIs</p>
                                            Start by reviewing the documentation of our <a
                                                href="{{ url('merchant-tools-ipn') }}">Instant Payment
                                                Notifications (IPNs)</a>.
                                            Then, move on to the two different types of transactions used for accepting
                                            payments
                                            found <a href="">here</a>. Once you decide the appropriate function to use,
                                            the
                                            rest
                                            of the documentation for our APIs can be found here. When using our APIs,
                                            you
                                            will
                                            need to reference your API PUBLIC KEY and API PRIVATE KEY.
                                        </li>
                                        <li>
                                            <p>Payment Buttons</p>
                                            You can use a <a href="{{ url('example-buttons') }}">Simple Payment
                                                Button</a>
                                            or an
                                            <a href="{{ url('advance-example-buttons') }}">Advanced Payment Button</a>.
                                            Charities can take advantage of a <a
                                                href="{{ url('donation-button-example') }}">Donation Button</a>
                                            with preset or
                                            adjustable amounts. Once you have the HTML code for your button, you can
                                            insert
                                            it
                                            on your website.
                                        </li>
                                    </ul>
                                </div>

                            </div>
                        </div>

                        <!--<div class="lp-element process even">
                            <div class="step-by-step process">
                                <div class="left step-by-step right step-con">
                                    <div class="step-by-step-img"><img src="{{ url('img/step-4.svg') }}" alt="logo">
                                    </div>
                                    <h2>Test Your Integration</h2>
                                </div>

                                <div class="right step-con">
                                    <h2>Test Your Integration</h2>


                                    <p class="testing-info">Now that you have finished the previous steps, there’s just
                                        one
                                        thing left to do – test a transaction!</p>
                                    <p class="testing-info">Luckily, Eco Banx  already has a free cryptocurrency
                                        dedicated
                                        to
                                        testing transactions for your integration – it’s called Litecoin Testnet (LTCT).
                                        It’s
                                        important to remember that LTCT has no real value, so this test can be completed
                                        at
                                        no
                                        cost to you.</p>
                                    <p class="testing-info">To get more information on testing your integration, please
                                        click <a href="">here</a>.</p>

                                </div>

                            </div>
                        </div> !-->

                    </div>
                </div>
            </div>
        </div>
    </section>




    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
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
    $(document).ready(function() {

        $('.extras').click(function() {

            $('.profile-list').toggleClass('showing')

        });

        $('.more-menu-bottom').click(function() {

            $('.extra-menu-mobile').toggleClass('showall-extramenus')

        })

    })
    </script>
    <script>
    $(document).ready(function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 100) { // Change 100 to the height you want to trigger the effect
                $('.sticky').addClass('is-sticky');
            } else {
                $('.sticky').removeClass('is-sticky');
            }
        });
    });
    </script>

</body>

</html>