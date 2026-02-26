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

    <!-- css -->
    <link rel="stylesheet" type="text/css" href="{{ url('css/style.css') }}">
    <link rel="stylesheet" type="text/css" href="{{ url('css/custom.css') }}">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('img/favicon_io/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('img/favicon_io/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('img/favicon_io/favicon-16x16.png') }}">
    <link rel="manifest" href="{{ url('/site.webmanifest') }}">


</head>

<body>

    @yield('content')
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