@php $title = "Profile"; $atitle ="profile";
@endphp
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

    <!-- country -->
    <link rel="stylesheet" href="https://cdn.tutorialjinni.com/intl-tel-input/17.0.19/css/intlTelInput.css" />
    <script src="https://cdn.tutorialjinni.com/intl-tel-input/17.0.19/js/intlTelInput.min.js"></script>

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('./img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('./img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('./img/favicon_io/favicon-16x16.png') }}">

</head>

<body>



    <section class="Dashboard-page profile">
        <div class="container-fluid">
            <div class="row">

                @include('layouts.menu')


                <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

                    <div class="header-part-outer">



                        <!-- <div class="profile-pic">
                  <img src="img/profile-pic.png" alt="" class="img-fluid">
                  <img src="img/add-symbol.png" alt="" class="symbol">
                </div> -->
                        <div class="profile-pic-wrapper">
                            <div class="pic-holder">
                                <!-- uploaded pic shown here -->
                                @if($user->profileimg !="")
                                <img id="profilePic" class="pic" src="{{$user->profileimg}}">
                                @else
                                <img id="profilePic" class="pic" src="img/profile-pic.png">
                                @endif

                                <Input class="uploadProfileInput" type="file" name="profile_pic" id="newProfilePhoto"
                                    accept="image/*" style="opacity: 0;" />
                                <label for="newProfilePhoto" class="upload-file-block">
                                    <div class="text-center">
                                        <div class="mb-2">
                                            <i class="fa fa-camera fa-2x"></i>
                                        </div>
                                        <div class="text-uppercase">
                                            Update <br /> Profile Photo
                                        </div>
                                    </div>
                                </label>
                            </div>

                        </div>


                        <div class="head-title-part">
                            <!-- <h1>Profile Account </h1> -->

                            <div class="account-label">
                                <div class="para-text">
                                    @if(Auth::user()->role == 'Business')
                                    <h4>{{ Auth::user()->business_name }} </h4>
                                    @else
                                    <h4>{{ Auth::user()->first_name }} {{ Auth::user()->last_name }}</h4>
                                    @endif
                                    <p></p>
                                </div>



                            </div>

                        </div>



                    </div>
                    @if (session('profilestatus'))
                    <div class="snackbar show" role="alert"><i class="fa fa-check-circle text-success"></i>
                        {{ session('profilestatus') }}</div>
                    @endif
                    <div class="profile-card">
                        <h3>{{ $user->role }} Info</h3>
                        <div class="row">

                            @if($user->role == 'Personal')
                            <div class="col-lg-12 col-xl-7 col-md-12 col-sm-12 col-xs-12">
                                <form action="{{ route('userprofile') }}" autocomplete="off" method="POST"
                                    id="formtarget" enctype='multipart/form-data'>
                                    {{ csrf_field() }}
                                    <div class="profile-list">
                                        <div class="form-group">
                                            <label>First Name <span>*</span></label>
                                            <input type="text" class="form-control" value="{{ $user->first_name }}"
                                                name="first_name">
                                            @if ($errors->has('first_name'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('first_name') }}</strong>
                                            </span>
                                            @endif
                                        </div>

                                        <div class="form-group">
                                            <label>Last Name <span>*</span></label>
                                            <input class="form-control" type="text" name="last_name"
                                                value="{{ $user->last_name }}" required>
                                            @if ($errors->has('last_name'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('last_name') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                    </div>

                                    <div class="profile-list">
                                        <div class="form-group">
                                            <label>Email </label>
                                            <input class="form-control" type="text" name="email"
                                                value="{{ $user->email }}" readonly>
                                            @if ($errors->has('email'))
                                            <span class="help-block">
                                                <strong class="text text-danger">{{ $errors->first('email') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                        <div class="form-group">
                                            <label>Select Country <span>*</span></label>
                                            <select name="country" class="form-control countries" id="countries"
                                                required="required">
                                                @if($user->country !="")
                                                <option>{{$user->country }}</option>
                                                @else
                                                <option value="" selected="">Country</option>
                                                @endif
                                            </select>
                                            @if ($errors->has('country'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('country') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                        <!-- <div class="form-group">
                    <label>Phone Number <span>*</span></label>
                    <input name="phone" type="text" id="phone" class="form-control phone" value="{{ $user->phone_no }}" />
                    <input type="hidden" readonly name="country_code" id="country_code" value=" {{ old('country_code') != '+49' ? old('country_code') : 1 }} "/>
                    @if ($errors->has('phone_no'))
					<span class="help-block">
					<strong class="text text-danger">{{ $errors->first('phone_no') }}</strong>
					</span>
					@endif
					@if ($errors->has('country_code'))
					<span class="help-block msg-txt">
						<strong>{{ $errors->first('country_code') }}</strong>
					</span>
					@endif
                </div> -->
                                    </div>

                                    <div class="profile-list">

                                    </div>

                                    <div class="withdraw-submit-btn submit-btn">
                                        <button>Submit</button>
                                    </div>
                                </form>
                            </div>
                            @else
                            <div class="col-lg-12 col-xl-7 col-md-12 col-sm-12 col-xs-12">
                                <form action="{{ route('userprofile') }}" autocomplete="off" method="POST"
                                    id="formtarget" enctype='multipart/form-data'>
                                    {{ csrf_field() }}
                                    <div class="profile-list">
                                        <div class="form-group">
                                            <label>Legal Business Name<span>*</span></label>
                                            <input type="text" class="form-control" value="{{ $user->business_name }}"
                                                name="business_name">
                                            @if ($errors->has('business_name'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('business_name') }}</strong>
                                            </span>
                                            @endif
                                        </div>

                                        <div class="form-group">
                                            <label>Company Website<span>*</span></label>
                                            <input class="form-control" type="text" name="company_website"
                                                value="{{ $user->company_website }}" required>
                                            @if ($errors->has('company_website'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('company_website') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                    </div>

                                    <div class="profile-list">
                                        <div class="form-group">
                                            <label>E-mail ID </label>
                                            <input class="form-control" type="text" name="email"
                                                value="{{ $user->email }}" readonly>
                                            @if ($errors->has('email'))
                                            <span class="help-block">
                                                <strong class="text text-danger">{{ $errors->first('email') }}</strong>
                                            </span>
                                            @endif
                                        </div>

                                        <div class="form-group">
                                            <label>Select Country <span>*</span></label>
                                            <select name="country" class="form-control countries" id="countries"
                                                required="required">
                                                @if($user->country !="")
                                                <option>{{$user->country }}</option>
                                                @else
                                                <option value="" selected="">Country</option>
                                                @endif
                                            </select>
                                            @if ($errors->has('country'))
                                            <span class="help-block">
                                                <strong
                                                    class="text text-danger">{{ $errors->first('country') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                    </div>

                                    <div class="profile-list">

                                    </div>

                                    <div class="withdraw-submit-btn submit-btn">
                                        <button>Submit</button>
                                    </div>
                                </form>
                            </div>
                            @endif

                            <div class="col-lg-12 col-xl-5 col-md-12 col-sm-12 col-xs-12">

                                <h3>Change Password</h3>
                                <form action="{{ url('changepassword') }}" method="POST">
                                    {{ csrf_field() }}
                                    <div class="change-password">
                                        @if (session('success_pwd'))
                                        <div class="alert alert-success alert-dismissible" role="alert">
                                            <strong>Success!</strong> {{ session('success_pwd') }}
                                        </div>
                                        @endif

                                        @if (session('error'))
                                        <div class="alert alert-danger alert-dismissible" role="alert">
                                            <strong>Failed!</strong> {{ session('error') }}
                                        </div>
                                        @endif
                                        <fieldset>
                                            <div class="form-card">
                                                <div class="form-group ">
                                                    <label>Current Password<span
                                                            class="text text-danger">*</span></label>
                                                    <input type="text" class="form-control" name="oldpassword"
                                                        class="form-control" id="oldpassword" value="" required>
                                                    @if ($errors->has('oldpassword'))
                                                    <span
                                                        class="text-danger errors-text show_error_email">{{ $errors->first('oldpassword') }}
                                                    </span>
                                                    @endif
                                                </div>

                                            </div>
                                        </fieldset>

                                        <fieldset>
                                            <div class="form-card">
                                                <div id="show_failed_login_password"></div>
                                                <div class="form-group ">
                                                    <label>New Password <span class="text text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <input type="password" class="form-control" name="newpassword"
                                                            class="form-control" value="" id="password" required>

                                                        <span class="input-group-text" id="passtexticon"
                                                            style="cursor: pointer;" onClick="getPasswordResponse()"><i
                                                                class="fa fa-eye-slash"></i> </span>
                                                    </div>
                                                </div>
                                                @if ($errors->has('newpassword'))
                                                <span
                                                    class="text-danger errors-text show_error_password">{{ $errors->first('newpassword') }}</span>
                                                @endif
                                            </div>
                                        </fieldset>

                                        <fieldset>
                                            <div class="form-card">
                                                <div id="show_failed_login_password"></div>
                                                <div class="form-group ">
                                                    <label>Confirm New Password <span
                                                            class="texts text-danger">*</span></label>
                                                    <div class="input-group">
                                                        <input type="password" name="confirmnewpassword"
                                                            autocomplete="current-password" required="" id="id_password"
                                                            class="form-control">
                                                        <span class="input-group-text"> <i class="fa fa-eye-slash"
                                                                id="togglePassword" style="cursor: pointer;"></i></span>
                                                        <!-- <span class="input-group-text" id="passtexticons" onClick="getPasswordResponse()"><i class="fa fa-eye-slash two"></i> </span> -->
                                                    </div>
                                                    @if ($errors->has('confirmnewpassword'))
                                                    <span
                                                        class="text-danger errors-text show_error_password">{{ $errors->first('confirmnewpassword') }}</span>
                                                    @endif
                                                </div>
                                            </div>
                                            <div class="withdraw-submit-btn submit-btn">
                                                <button type="submit" class="btn orangebg">Submit</button>
                                            </div>
                                        </fieldset>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    </section>



    <script>
    $(document).ready(function() {
        setTimeout(() => {
            $('.snackbar').remove();
        }, 3000);

        $('.extras').click(function() {

            $('.profile-list').toggleClass('showing')

        });

        $('.more-menu-bottom').click(function() {

            $('.extra-menu-mobile').toggleClass('showall-extramenus')

        })

    })
    $("ul.country-list").click(function() {
        var int = $('ul.country-list').find('li.active').attr('data-dial-code');
        $("#country_code").val(int);
        $("#phoneno1").val('+' + int);
        $(".phone_text").text('+' + int);
    });
    jQuery('#phoneno1').keyup(function() {
        var plus = $(this).val();
        var fistchar = plus.charAt(0);
        var int = $('ul.country-list').find('li.active').attr('data-dial-code');
        $("#country_code").val(int);
        if (fistchar != '+')
            $(this).val('+' + $(this).val());

    });

    jQuery(document).ready(function() {
        var plus = $(this).val();
        var fistchar = plus.charAt(0);
        var int = $('ul.country-list').find('li.active').attr('data-dial-code');
        $("#country_code").val(int);
        if (fistchar != '+')
            $(this).val('+' + $(this).val());

    });
    </script>

    <script>
    $(document).ready(function() {
        var $cat = $('select[name=country]'),
            $items = $('select[name=items]');

        $cat.change(function() {
            var $this = $(this).find(':selected'),
                rel = $this.attr('rel'),
                $set = $items.find('option.' + rel);

            if ($set.size() < 0) {
                $items.hide();
                return;
            }

            $items.show().find('option').hide();

            $set.show().first().prop('selected', true);
        });

        //copy phone number to coupon

        $('#phone').change(function() {
            $('#coupon').val($(this).val());
        });

        //reset the forms

        resetForms();

        function resetForms() {
            for (i = 0; i < document.forms.length; i++) {
                document.forms[i].reset();
            }
        }

    });
    </script>

    <script>
    function countriesDropdown(container) {
        var countries = {
            AFG: "Afghanistan",
            ALB: "Albania",
            ALG: "Algeria",
            AND: "Andorra",
            ANG: "Angola",
            ANT: "Antigua and Barbuda",
            ARG: "Argentina",
            ARM: "Armenia",
            ARU: "Aruba",
            ASA: "American Samoa",
            AUS: "Australia",
            AUT: "Austria",
            AZE: "Azerbaijan",
            BAH: "Bahamas",
            BAN: "Bangladesh",
            BAR: "Barbados",
            BDI: "Burundi",
            BEL: "Belgium",
            BEN: "Benin",
            BER: "Bermuda",
            BHU: "Bhutan",
            BIH: "Bosnia and Herzegovina",
            BIZ: "Belize",
            BLR: "Belarus",
            BOL: "Bolivia",
            BOT: "Botswana",
            BRA: "Brazil",
            BRN: "Bahrain",
            BRU: "Brunei",
            BUL: "Bulgaria",
            BUR: "Burkina Faso",
            CAF: "Central African Republic",
            CAM: "Cambodia",
            CAN: "Canada",
            CAY: "Cayman Islands",
            CGO: "Congo",
            CHA: "Chad",
            CHI: "Chile",
            CHN: "China",
            CIV: "Cote d'Ivoire",
            CMR: "Cameroon",
            COD: "DR Congo",
            COK: "Cook Islands",
            COL: "Colombia",
            COM: "Comoros",
            CPV: "Cape Verde",
            CRC: "Costa Rica",
            CRO: "Croatia",
            CUB: "Cuba",
            CYP: "Cyprus",
            CZE: "Czech Republic",
            DEN: "Denmark",
            DJI: "Djibouti",
            DMA: "Dominica",
            DOM: "Dominican Republic",
            ECU: "Ecuador",
            EGY: "Egypt",
            ERI: "Eritrea",
            ESA: "El Salvador",
            ESP: "Spain",
            EST: "Estonia",
            ETH: "Ethiopia",
            FIJ: "Fiji",
            FIN: "Finland",
            FRA: "France",
            FSM: "Micronesia",
            GAB: "Gabon",
            GAM: "Gambia",
            GBR: "Great Britain",
            GBS: "Guinea-Bissau",
            GEO: "Georgia",
            GEQ: "Equatorial Guinea",
            GER: "Germany",
            GHA: "Ghana",
            GRE: "Greece",
            GRN: "Grenada",
            GUA: "Guatemala",
            GUI: "Guinea",
            GUM: "Guam",
            GUY: "Guyana",
            HAI: "Haiti",
            HKG: "Hong Kong",
            HON: "Honduras",
            HUN: "Hungary",
            INA: "Indonesia",
            IND: "India",
            IRI: "Iran",
            IRL: "Ireland",
            IRQ: "Iraq",
            ISL: "Iceland",
            ISR: "Israel",
            ISV: "Virgin Islands",
            ITA: "Italy",
            IVB: "British Virgin Islands",
            JAM: "Jamaica",
            JOR: "Jordan",
            JPN: "Japan",
            KAZ: "Kazakhstan",
            KEN: "Kenya",
            KGZ: "Kyrgyzstan",
            KIR: "Kiribati",
            KOR: "South Korea",
            KOS: "Kosovo",
            KSA: "Saudi Arabia",
            KUW: "Kuwait",
            LAO: "Laos",
            LAT: "Latvia",
            LBA: "Libya",
            LBR: "Liberia",
            LCA: "Saint Lucia",
            LES: "Lesotho",
            LIB: "Lebanon",
            LIE: "Liechtenstein",
            LTU: "Lithuania",
            LUX: "Luxembourg",
            MAD: "Madagascar",
            MAR: "Morocco",
            MAS: "Malaysia",
            MAW: "Malawi",
            MDA: "Moldova",
            MDV: "Maldives",
            MEX: "Mexico",
            MGL: "Mongolia",
            MHL: "Marshall Islands",
            MKD: "Macedonia",
            MLI: "Mali",
            MLT: "Malta",
            MNE: "Montenegro",
            MON: "Monaco",
            MOZ: "Mozambique",
            MRI: "Mauritius",
            MTN: "Mauritania",
            MYA: "Myanmar",
            NAM: "Namibia",
            NCA: "Nicaragua",
            NED: "Netherlands",
            NEP: "Nepal",
            NGR: "Nigeria",
            NIG: "Niger",
            NOR: "Norway",
            NRU: "Nauru",
            NZL: "New Zealand",
            OMA: "Oman",
            PAK: "Pakistan",
            PAN: "Panama",
            PAR: "Paraguay",
            PER: "Peru",
            PHI: "Philippines",
            PLE: "Palestine",
            PLW: "Palau",
            PNG: "Papua New Guinea",
            POL: "Poland",
            POR: "Portugal",
            PRK: "North Korea",
            PUR: "Puerto Rico",
            QAT: "Qatar",
            ROU: "Romania",
            RSA: "South Africa",
            RUS: "Russia",
            RWA: "Rwanda",
            SAM: "Samoa",
            SEN: "Senegal",
            SEY: "Seychelles",
            SIN: "Singapore",
            SKN: "Saint Kitts and Nevis",
            SLE: "Sierra Leone",
            SLO: "Slovenia",
            SMR: "San Marino",
            SOL: "Solomon Islands",
            SOM: "Somalia",
            SRB: "Serbia",
            SRI: "Sri Lanka",
            SSD: "South Sudan",
            STP: "Sao Tome and Principe",
            SUD: "Sudan",
            SUI: "Switzerland",
            SUR: "Suriname",
            SVK: "Slovakia",
            SWE: "Sweden",
            SWZ: "Swaziland",
            SYR: "Syria",
            TAN: "Tanzania",
            TGA: "Tonga",
            THA: "Thailand",
            TJK: "Tajikistan",
            TKM: "Turkmenistan",
            TLS: "Timor-Leste",
            TOG: "Togo",
            TPE: "Chinese Taipei",
            TTO: "Trinidad and Tobago",
            TUN: "Tunisia",
            TUR: "Turkey",
            TUV: "Tuvalu",
            UAE: "United Arab Emirates",
            UGA: "Uganda",
            UKR: "Ukraine",
            URU: "Uruguay",
            USA: "United States",
            UZB: "Uzbekistan",
            VAN: "Vanuatu",
            VEN: "Venezuela",
            VIE: "Vietnam",
            VIN: "Saint Vincent and the Grenadines",
            YEM: "Yemen",
            ZAM: "Zambia",
            ZAN: "Zanzibar",
            ZIM: "Zimbabwe"
        }
        @if($user -> country != "")
        var out = "<select><option rel=''>{{$user->country }}</option>";
        @else
        var out = "<select><option rel=''>Country</option>";
        @endif

        for (var key in countries) {
            out += "<option rel='" + key + "'>" + countries[key] + "</option>";
        }
        out += "</select>";

        document.getElementById(container).innerHTML = out;
    }
    countriesDropdown("countries");
    </script>




    <script>
    //password show/hide
    function getPasswordResponse() {
        var password_repsonse = document.getElementById("password");
        if (password_repsonse.getAttribute('type') === "password") {
            password_repsonse.setAttribute('type', 'text');
            document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye" aria-hidden="true"></i>';
        } else {
            password_repsonse.setAttribute('type', 'password');
            document.getElementById("passtexticon").innerHTML = '<i class="fa fa-eye-slash" aria-hidden="true"></i>';
        }
    }
    </script>


    <script>
    const togglePassword = document.querySelector('#togglePassword');
    const password = document.querySelector('#id_password');

    togglePassword.addEventListener('click', function(e) {
        // toggle the type attribute
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        // toggle the eye slash icon
        this.classList.toggle('fa-eye');
    });
    </script>

    <script>
    var input = document.querySelector("#phone");
    window.intlTelInput(input, {
        separateDialCode: true
    });
    </script>



    <script>
    $(document).on("change", ".uploadProfileInput", function() {
        var triggerInput = this;
        var currentImg = $(this).closest(".pic-holder").find(".pic").attr("src");
        var holder = $(this).closest(".pic-holder");
        var wrapper = $(this).closest(".profile-pic-wrapper");
        $(wrapper).find('[role="alert"]').remove();
        triggerInput.blur();
        var files = !!this.files ? this.files : [];
        if (!files.length || !window.FileReader) {
            return;
        }
        if (/^image/.test(files[0].type)) {
            // only image file
            var reader = new FileReader(); // instance of the FileReader
            reader.readAsDataURL(files[0]); // read the local file

            reader.onloadend = function() {
                $(holder).addClass("uploadInProgress");
                $(holder).find(".pic").attr("src", this.result);
                $("#profile-Image").attr("src", this.result);
                $(holder).append(
                    '<div class="upload-loader"><div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div></div>'
                );
                var formData = new FormData();
                let name = $("input[name=username]").val();
                let _token = "{{ csrf_token() }}";
                var photo = $('#newProfilePhoto').prop('files')[0];

                formData.append('photo', photo);
                formData.append('name', name);
                formData.append('_token', _token);

                $.ajax({
                    url: "{{route('uploadProfile')}}",
                    type: 'POST',
                    contentType: 'multipart/form-data',
                    cache: false,
                    contentType: false,
                    processData: false,
                    data: formData,
                    success: (response) => {
                        $(holder).removeClass("uploadInProgress");
                        $(holder).find(".upload-loader").remove();
                        if (response.status == 'success') {
                            $(wrapper).append(
                                '<div class="snackbar show" role="alert"><i class="fa fa-check-circle text-success"></i> Profile image updated successfully</div>'
                            );
                            // Clear input after upload
                            $(triggerInput).val("");

                            setTimeout(() => {
                                $(wrapper).find('[role="alert"]').remove();
                            }, 3000);
                        } else {
                            $(holder).find(".pic").attr("src", currentImg);
                            $(wrapper).append(
                                '<div class="snackbar show" role="alert"><i class="fa fa-times-circle text-danger"></i> There is an error while uploading! Please try again later.</div>'
                            );
                            // Clear input after upload
                            $(triggerInput).val("");
                            setTimeout(() => {
                                $(wrapper).find('[role="alert"]').remove();
                            }, 3000);
                        }
                    },
                    error: (response) => {
                        $(wrapper).append(
                            '<div class="alert alert-danger d-inline-block p-2 small" role="alert">Please choose the valid image.</div>'
                        );
                        setTimeout(() => {
                            $(wrapper).find('role="alert"').remove();
                        }, 3000);
                        console.log(response);
                    }
                });


            };
        } else {
            $(wrapper).append(
                '<div class="alert alert-danger d-inline-block p-2 small" role="alert">Please choose the valid image.</div>'
            );
            setTimeout(() => {
                $(wrapper).find('role="alert"').remove();
            }, 3000);
        }
    });
    </script>


</body>

</html>
