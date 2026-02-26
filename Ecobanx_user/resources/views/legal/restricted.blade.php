<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password | Eco Banx Foundation</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
        integrity="sha512-Kc323vGBEqzTmouAECnVceyQqyqdsSiqLQISBL29aUW4U/M7pSPA/gEUZQqv1cwx4OnYxTxve5UMg5GT6L4JJg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"
        integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous">
    </script>

    <link rel="stylesheet" href="{{ url('css/legal.css') }}">
</head>

<body>
    <section>
        <div class="">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-sm-12 col-md-12 col-lg-3 col-xl-3">
                        @include('legal.sidebar')
                    </div>
                    <div class="col-sm-12 col-md-12 col-lg-9 col-xl-9">
                        @include('legal.header')
                        <div class="legal-main">
                            <div class="container">
                                <div class="legal-main-card">
                                    <h1>Restricted Jurisdictions For Using Eco Banx PAY.</h1>

                                    <ul>
                                        <li>
                                            By accessing and using <a href="#"> </a> or any
                                            of
                                            Eco Banx Company or any
                                            of their respective partners' services, you acknowledge and confirm that you
                                            are
                                            not on any trade or economic sanctions list, such as the UN Security Council
                                            Sanctions list or the Office of Foreign Assets Control (OFAC) list or in
                                            breach
                                            of applicable law.
                                        </li>
                                        <li>
                                            Each of Eco Banx Companies reserves the right to select the
                                            jurisdictions where it provides its services and may restrict or deny its
                                            services to persons or entities in certain jurisdictions. Prohibited persons
                                            should not use or access <a href="#"></a>
                                        </li>
                                        <li>The following is a list of countries and jurisdictions where Eco Banx 's
                                            services are unavailable:</li>
                                    </ul>
                                    <div class="Country-text">Country</div>
                                    <div class="legal-main-card-row">
                                        <div class="row">
                                            <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                <ul>
                                                    <li>AFGHANISTAN </li>
                                                    <li>ALGERIA</li>
                                                    <li>AMERICAN SAMOA</li>
                                                    <li>BANGLADESH</li>
                                                    <li>BELARUS</li>
                                                    <li>BOSNIA AND HERZEGOVINA</li>
                                                    <li>CAMBODIA</li>
                                                    <li>CONGO</li>
                                                    <li>CONGO, DEMOCRATIC REPUBLIC</li>
                                                    <li>CÔTE D'IVOIRE</li>
                                                    <li>CUBA</li>
                                                    <li>DJIBOUTI</li>
                                                    <li>ERITREA</li>
                                                    <li>GUINEA</li>
                                                    <li>GUINEA-BISSAU</li>
                                                    <li>IRAN, ISLAMIC REPUBLIC OF</li>
                                                    <li>IRAQ</li>
                                                    <li>JORDAN</li>
                                                    <li>LEBANON</li>
                                                </ul>
                                            </div>
                                            <div class="col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                                <ul>
                                                    <li>LIBERIA</li>
                                                    <li>LIBYA</li>
                                                    <li>MALI</li>
                                                    <li>MYANMAR</li>
                                                    <li>NEPAL</li>
                                                    <li>NIGER</li>
                                                    <li>NORTH KOREA (DPRK)</li>
                                                    <li>PALESTINE, STATE OF</li>
                                                    <li>QATAR</li>
                                                    <li>RUSSIAN FEDERATION</li>
                                                    <li>SOMALIA</li>
                                                    <li>SOUTH SUDAN</li>
                                                    <li>SUDAN</li>
                                                    <li>SYRIAN ARAB REPUBLIC</li>
                                                    <li>UGANDA</li>
                                                    <li>UNITED STATES</li>
                                                    <li>YEMEN</li>
                                                    <li>ZIMBABWE (RHODESIA)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- @include('layouts.footer') -->
</body>

</html>