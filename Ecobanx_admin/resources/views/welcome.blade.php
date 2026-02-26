<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Admin Panel | {{ config('app.name') }} </title>
    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('/favicon/favicon-16x16.png') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- favicon !-->

    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="theme-color" content="#ffffff">
    <!-- Vendor styles -->
    <link rel="stylesheet" href="{{ url('adminpanel/css/material-design-iconic-font.min.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/css/animate.min.css') }}">
    <!-- App styles -->
    <link rel="stylesheet" href="{{ url('adminpanel/css/app.min.css') }}">
</head>

<body data-sa-theme="7">

    <div class="login-page-flex-block">

        <!-- <div class="right-img">
   <img src="{{ url('/images/confirm-pageright-img.svg') }}" class="logo-text" />
   </div> -->

        <!-- Login -->
        <div class="login">
            <div class="login__block active" id="l-login">
                <!-- <img src="{{ url('/images/logo.png') }}" class="logo-text" /> -->
                <!-- <div class="login__block__header">
                <i class="zmdi zmdi-account-circle"></i>
                Admin Panel                 
            </div> -->
                <h2>Admin Panel</h2>
                <h3>Login</h3>
                <p>Please login to your account</p>
                <div class="login__block__body">
                    @if(session('error'))
                    <div class="alert alert-danger">
                        {{ session('error') }}
                    </div>
                    @endif
                    <form class="form-horizontal" role="form" method="POST" action="{{ url('login') }}"
                        autocomplete="nope">
                        {{ csrf_field() }}
                        <div class="form-group">
                            <label>Email</label>
                            <input type="text" class="form-control text-center" name="email" value="{{ old('email') }}">
                            @if ($errors->has('email'))
                            <span class="help-block">
                                <strong>{{ $errors->first('email') }}</strong>
                            </span>
                            @endif
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <div class="password-block">
                                <input type="password" name="password" class="form-control text-center" id="password">
                                <span class="input-group-text" id="passtexticon" onclick="getPasswordResponse()"><i
                                        class="fa fa-eye-slash" aria-hidden="true"></i></span>
                            </div>
                            @if ($errors->has('password'))
                            <span class="help-block">
                                <strong>{{ $errors->first('password') }}</strong>
                            </span>
                            @endif
                        </div>
                        <button type="submit" name="secure-adminlogin"
                            class="btn btn--icon login__block__btn">Login</button>
                    </form>
                </div>
            </div>
        </div>



    </div>

    <script src="{{ url('adminpanel/js/jquery.min.js') }}"></script>
    <script src="{{ url('adminpanel/js/popper.min.js') }}"></script>
    <script src="{{ url('adminpanel/js/bootstrap.min.js') }}"></script>
    <script src='https://www.google.com/recaptcha/api.js'></script>
    <script src="{{ url('adminpanel/js/app.min.js') }}"></script>

    <script>
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
    <!--Start of Tawk.to Script-->
    <!-- <script defer>
    setTimeout(function() {
        var Tawk_API = Tawk_API || {},
            Tawk_LoadStart = new Date();

        (function() {
            var s1 = document.createElement("script"),
                s0 = document.getElementsByTagName("script")[0];
            s1.async = true;
            s1.src = 'https://embed.tawk.to/676134feaf5bfec1dbdd5a5b/1if9re0vu';
            s1.charset = 'UTF-8';
            s1.setAttribute('crossorigin', '*');
            s0.parentNode.insertBefore(s1, s0);
        })();

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_API.onLoad = function() {
            const tryRevealWidget = () => {
                const iframe = document.querySelector('iframe[title="chat widget"]');
                const widget = iframe?.parentElement;

                if (iframe && widget) {
                    widget.style.setProperty("display", "block", "important");
                    widget.classList.remove("widget-hidden");
                    widget.style.setProperty("position", "fixed", "important");

                    if (window.innerWidth <= 1199) {
                        // Mobile view
                        iframe.style.setProperty("bottom", "100px", "important");
                        iframe.style.setProperty("right", "10px", "important");
                        iframe.style.setProperty("top", "auto", "important");
                    } else {
                        // Desktop view
                        iframe.style.setProperty("bottom", "0px", "important");
                        iframe.style.setProperty("right", "0px", "important");
                        iframe.style.setProperty("top", "auto", "important");
                    }

                    console.log("✅ Tawk widget iframe repositioned.");
                } else {
                    setTimeout(tryRevealWidget, 500); // Retry if not found
                }
            };

            // Wait a little to let Tawk render DOM
            setTimeout(tryRevealWidget, 1000);

            // Re-apply on resize too
            window.addEventListener("resize", tryRevealWidget);
        };
    }, 1000);
    </script> -->
    <!--End of Tawk.to Script-->
</body>

</html>