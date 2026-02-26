@include('layouts.outerheader')


<main class="homepage-page">
    <section class="banner-section crypto-bg">
        <div class="contain-width">
            <div class="row">
                <div class="col-xl-7 col-lg-7 col-md-12 col-sm-12">
                    <h1>THE BEST<span> CRYPTO PAYMENT</span> FOR BUSINESS.</h1>
                    <p class="para-text">
                        The perfect solution for cryptocurrency settlements between
                        business partners. Cheap, fast, and secure.
                    </p>
                    <a href="{{ url('/register') }}" class="crypto-coin-link">
                        <span class="wallet-link">GET STARTED</span>

                        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                        </svg>
                    </a>
                </div>
                <div class="col-xl-5 col-lg-5 col-md-12 col-sm-12">
                    <div class="banner-right-img">
                        <img src="{{ url('/outerpage-assert/image/crypto-payment-banner.webp') }}" width="581"
                            height="581" alt="best-crypto-payment">
                    </div>
                </div>
            </div>
            <div class="partner-can-trust section-top-padding">
                <div class="row">
                    <div class="col-xl-5 col-lg-5 col-md-12 col-sm-12" data-animation="fadeInLeft">
                        <div class="crypto-sub-head">
                            <span> <img src="{{ url('/outerpage-assert/image/four-star.svg') }}"
                                    alt="about-wallet"></span>
                            <span>About Eco Banx PAY</span>
                        </div>
                        <h2>The partner you can trust<span>.</span></h2>
                    </div>
                    <div class="col-xl-7 col-lg-7 col-md-12 col-sm-12">
                        <div class="row about-Hashcodex-right">
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-lg-4">
                                <div class="partner-trust-block">
                                    <h4>9<span>+</span></h4>
                                    <span class="partner-trust-text">Years of crypto <br />expertise</span>
                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-lg-4">
                                <div class="partner-trust-block">
                                    <h4>0<span>.</span></h4>
                                    <span class="partner-trust-text">Lost funds of <br />our clients</span>
                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 mb-lg-4">
                                <div class="partner-trust-block">
                                    <h4>8<span>%</span></h4>
                                    <span class="partner-trust-text">Of all on-chain <br />Bitcoin transactions</span>
                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
                                <div class="partner-trust-block">
                                    <h4>500<span>+</span></h4>
                                    <span class="partner-trust-text">Satisfied customers<br />
                                        in various industries</span>
                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
                                <div class="partner-trust-block">
                                    <h4>34<span>M</span></h4>
                                    <span class="partner-trust-text">Transactions <br />processed</span>
                                </div>
                            </div>
                            <div class="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6">
                                <div class="partner-trust-block">
                                    <h4>12<span>B</span></h4>
                                    <span class="partner-trust-text">Euro processed <br />in crypto</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="feature-partener section-top-padding">
        <div class="contain-width">
            <div class="section-head">
                <div class="crypto-sub-head">
                    <span> <img src="{{ url('/outerpage-assert/image/four-star.svg') }}" alt="focuses" /></span>
                    <span>FOCUSES</span>
                </div>
                <h2>
                    Killer <span>feature</span> for settlements with
                    <span>partners.</span>
                </h2>

                <p class="para-text">
                    Our business crypto wallet is intuitively easy to use for recieving,
                    storing, exchanging and sending payments in 30+ crypto. It is the
                    best solution for affiliate programs, traffic exchanges, IT
                    developers, marketing services, payment providers, real estate
                    agencies, financial institutions and a lot more.
                </p>
            </div>

            <div class="row feature-blocks">
                <!-- <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-right" data-aos-duration="3100">
                        <h3 class="card-sub-title">0% Volatility risk<span>.</span></h3>
                        <p>
                            You can hold 20+ fiat currencies on your balance and just
                            convert them into crypto when do a payment.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-1.svg') }}" alt="Volatility-risk"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div> -->
                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-left" data-aos-duration="3100">
                        <h3 class="card-sub-title">Global coverage<span>.</span></h3>
                        <p>
                            Cryptocurrency is borderless, you can pay your partners in
                            crypto everywhere in the world.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-2.svg') }}" alt="Global-coverage"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-right" data-aos-duration="3100">
                        <h3 class="card-sub-title">Transparent fees<span>.</span></h3>
                        <p>
                            We charge only a flat fee on processing or exchange
                            transactions, with no markups on exchange rates. Also, you can
                            get up to a 50% discount with our loyalty program.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-3.svg') }}" alt="Transparent-fees"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-left" data-aos-duration="3100">
                        <h3 class="card-sub-title">Fast onboarding<span>.</span></h3>
                        <p>
                            Our in-house compliance department conducts KYB and opens an
                            account shortly.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-4.svg') }}" alt="Fast-onboarding"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div>
                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-right" data-aos-duration="3100">
                        <h3 class="card-sub-title">Accounting documents<span>.</span></h3>
                        <p>
                            You can get any required accounting documentation on every
                            operation you deal with.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-5.svg') }}" alt="Accounting-documents"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div>
                <!-- <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                    <div class="card-block card feature-block" data-aos="zoom-in-left" data-aos-duration="3100">
                        <h3 class="card-sub-title">
                            Swift & sepa supported<span>.</span>
                        </h3>
                        <p>
                            You can top-up your account in SWIFT and SEPA and buy crypto for
                            your needs, or, you can withdraw fiat directly to your bank
                            account.
                        </p>
                        <div class="feature-card-img">
                            <img src="{{ url('/outerpage-assert/image/feature-img-6.svg') }}" alt="Swift-sepa-supported"
                                loading="lazy" width="80" height="80" />
                        </div>
                    </div>
                </div> -->
            </div>
        </div>
    </section>

    <div class="crypto-bg">
        <section class="crypto-currency-features section-top-padding ">
            <div class="contain-width">
                <div class="crypto-currency-block card-block card-bg">
                    <div class="row">
                        <div class="col-xl-7 col-lg-7 col-md-12 col-sm-12">
                            <div class="crypto-currency-block-left">
                                <h3>We got all crypto currency<span> features.</span></h3>
                                <ul>
                                    <li>
                                        <b>PAY IN CRYPTO</b>— Instantly pay your partners with any
                                        crypto of your choice with a low mining fee.
                                    </li>
                                    <li>
                                        <b>BUY CRYPTO WITH FIAT</b>— Top up your account with fiat
                                        and buy crypto for your needs with our built-in exchange or
                                        OTC desk.
                                    </li>
                                    <li>
                                        <b>INVOICE WITH CRYPTO</b>— Bill your partners in crypto
                                        with invoice and payment link options, and receive the
                                        equivalent amount in fiat on your account.
                                    </li>
                                    <li>
                                        <b>DO MASS PAYOUTS</b>— Make different crypto payouts on
                                        multiple addresses from one single wallet by simply
                                        uploading a balance sheet.
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="col-xl-5 col-lg-5 col-md-12 col-sm-12">
                            <div class="crypto-currency-block-right">
                                <img src="{{ url('/outerpage-assert/image/crypto-currency-features-img.webp') }}"
                                    alt="crypto-currency-features" loading="lazy" width="429" height="429" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="key-benefits section-top-padding">

            <div class="contain-width">
                <div class="section-head">
                    <h2>
                        key benefits of our <span>leading payment
                        </span>solutions.
                    </h2>
                    <p class="para-text">
                        Cryptoprocessing by Eco Banx satisfies 99% of your business & your
                        customers needs.
                    </p>
                </div>
                <div class="leading-payment-img text-center">
                    <img src="{{ url('/outerpage-assert/image/leading-payment-img.webp') }}"
                        alt="key-benefits-our-leading-payment-solution" class="img-fluid" width="400" height="400" />
                </div>
                <div class="row">
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                        <div class="card-block card key-benefits-card" data-animation="fadeInLeft">
                            <h3 class="card-sub-title">Simple <br>integration <span>.</span></h3>
                            <p>
                                We offer one of the best APIs on the market with full integration support via a
                                dedicated
                                manager.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-1.svg') }}"
                                    alt="Simple-integration" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12 top-margin">
                        <div class="card-block card key-benefits-card" data-animation="fadeInLeft">
                            <h3 class="card-sub-title"> Instant<br>transactions <span>.</span></h3>
                            <p>
                                We support instant transaction confirmation for the most popular cryptocurrencies, even
                                before they are confirmed by blockchain.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-2.svg') }}"
                                    alt="Instant-transactions" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12 ">
                        <div class="card-block card key-benefits-card" data-animation="fadeInLeft">
                            <h3 class="card-sub-title">Treasury<br> management <span>.</span></h3>
                            <p>
                                Multi-level wallet system which allows sending funds from hot wallet to external one or
                                cold
                                storage automatically based on set thresholds by merchants.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-3.svg') }}"
                                    alt="Treasury-management" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                        <div class="card-block card key-benefits-card" data-animation="fadeInRight">
                            <h3 class="card-sub-title">Innovative liquidity<br> aggregator <span>.</span></h3>
                            <p>
                                Our liquidity aggregator has integration with all the leading exchanges and liquidity
                                providers giving you the best exchange rates and minimum slippage on any.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-4.svg') }}"
                                    alt="Innovative-liquidity-aggregator" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12 top-margin">
                        <div class="card-block card key-benefits-card" data-animation="fadeInRight">
                            <h3 class="card-sub-title">Loyalty program <br>discounts <span>.</span></h3>
                            <p>
                                Get up to a 50% discount on all transactions by using our own utility token. Contact
                                sales
                                team to learn more.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-5.svg') }}"
                                    alt="Loyalty-program-discounts" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                        <div class="card-block card key-benefits-card" data-animation="fadeInRight">
                            <h3 class="card-sub-title"> Swift & sepa <br>supported <span>.</span></h3>
                            <p>
                                Only transparent pricing with no hidden fees and zero markups on exchange rates.
                            </p>
                            <div class="feature-card-img">
                                <img src="{{ url('/outerpage-assert/image/key-benefits-img-6.svg') }}"
                                    alt=" Swift-sepa-supported" loading="lazy" width="80" height="80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    </div>

    <section class="start-crypto-journey section-top-padding crypto-bg">
        <div class="contain-width">
            <div class="section-head">
                <h2>Start your journey with <span>crypto </span> today<span>!</span> </h2>
                <p class="para-text">Leave the request nowand your personal manager will contact you in 5 minutes via
                    email.</p>
                <div class="crypto-journey-btn">
                    <a href="#" class="crypto-coin-link">
                        <span class="wallet-link">REQUEST NOW</span>

                        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                        </svg>
                    </a>
                    <a href="#" class="crypto-coin-link">
                        <span class="wallet-link">OTHER QUESTIONS</span>

                        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                        </svg>
                    </a>
                </div>
                <p class="note">*choose the “Other questions” option if you don’t need a sales manager, but a support
                    team</p>

            </div>

            <div class="join-today-block card-block card-bg" data-animation="fadeInRight">
                <div class="row">
                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <div class="join-today-img">
                            <img src="{{ url('/outerpage-assert/image/winning-team-img.webp') }}"
                                alt="join-winning-team-today" width="360" height="360" class="img-fluid">
                        </div>
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <h3>
                            JOIN THE<span> WINNING TEAM </span>TODAY.
                        </h3>
                        <div class="download-app">
                            <div class="download-app-icon"><i class="fa-brands fa-apple"></i></div>
                            <div class="download-app-icon"><i class="fa-brands fa-google-play"></i></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="faq section-top-padding">
        <div class="contain-width">

            <h2><span> Frequently </span> Asked Questions<span>.</span></h2>

            <div class="accordion accordion-flush faq-accordion" id="accordionFlushExample">
                <div class="accordion-item">
                    <h3 class="accordion-header" id="flush-headingOne">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">
                            <span>What is a Crypto Payment Gateway<i class="fa-solid fa-question"></i></span>
                        </button>

                    </h3>
                    <div id="flush-collapseOne" class="accordion-collapse collapse" aria-labelledby="flush-headingOne"
                        data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">
                            <p> A crypto payment gateway is a digital service that allows merchants to accept payments
                                in cryptocurrencies like Bitcoin, Ethereum, or other digital assets. These gateways
                                facilitate the processing, verification, and conversion of cryptocurrency transactions
                                into either other cryptocurrencies or fiat currencies. They ensure that payments are
                                secure, fast, and with lower processing costs, providing an alternative to traditional
                                payment methods like credit cards or bank transfers. Crypto payment gateways are easy to
                                integrate with e-commerce platforms, making it easy for businesses to accept
                                cryptocurrency payments online.</p>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h3 class="accordion-header" id="flush-headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">
                            <span> How Do you Set Up a Crypto Payment Gateway<i class="fa-solid fa-question"></i></span>
                        </button>
                    </h3>
                    <div id="flush-collapseTwo" class="accordion-collapse collapse" aria-labelledby="flush-headingTwo"
                        data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">

                            <p> To set up a crypto payment gateway,such as Eco Banx Pay, is quick and straightforward.
                                Just follow the steps below.</p>
                            <ul>

                                <li>Register and Verify: Sign up for an account and complete the verification process,
                                    which includes an identity verification and questionnaire related to the nature of
                                    your business activities.</li>
                                <li>Integrate with Your Platform: Use the provided APIs or plugins to integrate our
                                    payment gateway with your e-commerce platform, website, or point-of-sale system.
                                </li>
                                <li>Configure Crypto Payments: Customize the payment gateway settings according to your
                                    business needs, including setting up accepted cryptocurrencies, payment buttons, and
                                    payout preferences.</li>
                                <li>Test the Integration: Run test transactions to ensure everything is working
                                    correctly before going live.</li>
                            </ul>
                            <p> Once testing is successful, you can start accepting cryptocurrency payments from
                                customers.</p>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h3 class="accordion-header" id="flush-headingThree">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseThree" aria-expanded="false"
                            aria-controls="flush-collapseThree">
                            <span> How Do I Create a Crypto Payment Gateway<i class="fa-solid fa-question"></i></span>
                        </button>
                    </h3>
                    <div id="flush-collapseThree" class="accordion-collapse collapse"
                        aria-labelledby="flush-headingThree" data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">
                            <p>To create a crypto payment gateway with Eco Banx Pay, start by registering for an account
                                on our platform.</p>
                            <p> The registration process is fast, typically taking around 5 minutes to complete.
                                Afterward, you'll need to verify your identity. Once your account is verified, you can
                                begin integrating the payment gateway into your business, allowing you to receive
                                payments in over 30 supported cryptocurrencies.</p>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h3 class="accordion-header" id="flush-headingFour">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#flush-collapseFour" aria-expanded="false"
                            aria-controls="flush-collapseFour">
                            <span> What is a Fiat-to-Crypto Payment Gateway<i class="fa-solid fa-question"></i></span>
                        </button>
                    </h3>
                    <div id="flush-collapseFour" class="accordion-collapse collapse" aria-labelledby="flush-headingFour"
                        data-bs-parent="#accordionFlushExample">
                        <div class="accordion-body">
                            <p>A Fiat-to-Crypto Payment Gateway is a service that allows users to convert fiat currency
                                (like USD, EUR) into cryptocurrency. This gateway allows businesses to accept payments
                                in traditional currencies, which are then seamlessly converted into cryptocurrency and
                                credited to the merchant’s account.
                                 </p>
                            <p> Eco Banx Pay supports both fiat and cryptocurrency payments, providing flexibility for
                                businesses that wish to operate in both financial spaces.
                            </p>

                        </div>
                    </div>
                </div>
            </div>
        </div>

    </section>

</main>

@include('layouts.outerfooter')