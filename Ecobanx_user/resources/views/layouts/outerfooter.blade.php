<section class="footer">
    <div class="contain-width">
        <div class="footer-top">
            <div class="row footer-top-block-1">
                <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                    <a href="{{ url('/') }}" class="footer-logo">
                        <img src="{{ url('/outerpage-assert/image/Hashcodex-header-logo.png') }}" alt="logo" width="50"
                            height="45">
                    </a>
                </div>
                <div class="col-xl-4 col-lg-5 col-md-6 col-sm-12">
                    <h3>Join Now</h3>

                    <div class="footer-sign-btn">
                        <a href="{{ url('/register') }}">SIGN UP </a>
                    </div>
                </div>
                <div class="col-xl-3 col-lg-2">
                </div>
                <div class="col-xl-3 col-lg-5 col-md-6 col-sm-12">
                    <h3>Follow us
                    </h3>

                    <div class="foot-social-media">
                        <a href="#" target="_blank" class="sm-logo"><i class="fa-brands fa-facebook-f"></i></a>
                        <a href="#" target="_blank" class="sm-logo"><i class="fa-brands fa-x-twitter"></i></a>
                        <a href="#" target="_blank" class="sm-logo"><i class="fa-brands fa-linkedin-in"></i></a>
                        <a href="#" target="_blank" class="sm-logo"><i class="fa-brands fa-instagram"></i></a>
                        <a href="#" target="_blank" class="sm-logo"><i class="fa-brands fa-medium"></i></a>
                    </div>
                </div>
            </div>

            <div class="row footer-top-block-2">
                <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                    <h4 class="foot-sub-title">
                        Eco Banx PAY
                    </h4>

                    <ul class="footer-link">
                        <li>
                            <a href="{{ url('/fees') }}"> Fees/ Pricing</a>
                        </li>
                        <li><a href="{{ url('/supported-coins') }}">Supported Coins</a></li>
                    </ul>


                </div>

                <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                    <h4 class="foot-sub-title">
                        RESOURCES
                    </h4>

                    <ul class="footer-link">
                        <li>
                            <a href="{{ url('/merchant-tool') }}"> Merchant Tools</a>

                        </li>
                        <li><a href="#">Integration
                                Guide</a>
                        </li>
                        <li><a href="{{ url('/invoice-builder') }}">Store Directory</a>
                        </li>
                        <li><a href="#">FAQ</a></li>
                    </ul>


                </div>
                <div class="col-xl-2 col-lg-2 col-md-6 col-sm-12">
                    <h4 class="foot-sub-title">
                        CONTACT
                    </h4>
                    <ul class="footer-link">
                        <li>
                            <a href="{{ route('support') }}"> Support</a>
                        </li>

                        <li><a href="#">Sales</a></li>
                    </ul>


                </div>

                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12">
                    <h4 class="foot-sub-title">
                        LEGAL



                    </h4>

                    <ul class="footer-link">
                        <li><a href="{{ url('/restricted-jurisdictions') }}">Restricted Jurisdictions</a></li>
                        <li> <a href="{{ url('/user-agreement') }}">User Agreement</a></li>
                        <li> <a href="{{ url('/privacy-policy') }}">Privacy Policy</a></li>
                    </ul>


                </div>
                <div class="col-xl-3 col-lg-3 col-md-6 col-sm-12">
                    <h4 class="foot-sub-title">
                        NEWSLETTER
                    </h4>

                    <p>Stay up to date with the latest news:</p>
                    <input type="text" class="newsletter-input">
                    <a href="#" class="crypto-coin-link">
                        <span class="wallet-link">SUBSCRIBE</span>
                        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                        </svg>
                    </a>


                </div>
            </div>

        </div>
        <div class="copy-rights-block">

            <p>Copyright © 2024 Eco Banx </P>
            <span>
                Eco Banx PAY Services are not available in United States, UK and other prohibited jurisdictions. No
                legal,
                tax, investment, or other advice is provided by any Eco Banx entity. Please consult your
                legal/tax/investment professional for questions about your specific circumstances. Digital asset
                holdings involve a high degree of risk, and can fluctuate greatly on any given day. Accordingly, your
                digital asset holdings may be subject to large swings in value and may even become worthless.
            </span>

        </div>
    </div>

</section>



<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous">
</script>
<script src="{{ url('outerpage-assert/js/jquery.min.js') }}"></script>

<script>
$(document).ready(function() {

    $('section.header-part a.close-menu i').click(function(e) {
        e.preventDefault();

        $('.navbar-collapse.collapse').removeClass('close-main-menu');

    });

    $('a.close-menu').click(function() {

        $(this).parent('.collapse').removeClass('show');

    });


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

<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
<script>
AOS.init();
</script>
<script>
const animatedEls = document.querySelectorAll("[data-animation]");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        const animation = entry.target.getAttribute("data-animation");

        if (entry.isIntersecting) {
            entry.target.classList.add("animated", `${animation}`);
        } else {
            entry.target.classList.remove("animated", `${animation}`);
        }
    });
});

animatedEls.forEach((el) => observer.observe(el));
</script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js"
    integrity="sha512-Ysw1DcK1P+uYLqprEAzNQJP+J4hTx4t/3X2nbVwszao8wD+9afLjBQYjz7Uk4ADP+Er++mJoScI42ueGtQOzEA=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></script>

<script>
var swiper = new Swiper(".mySwiper-1", {
    slidesPerView: 3,
    loop: true,
    autoplay: true,
    spaceBetween: 30,
    grabCursor: true,
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },

    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        0: {
            slidesPerView: 1,
        },
        700: {
            slidesPerView: 2,
        },
        950: {
            slidesPerView: 3,
        },
    },

});
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