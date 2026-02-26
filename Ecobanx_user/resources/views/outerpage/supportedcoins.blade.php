@php
$title = 'Supported Coins';
$atitle = 'support coins';
@endphp

@include('layouts.outerheader')

<main class="supported-coin-page">
    <section class="banner-section crypto-bg">
        <div class="contain-width">
            <div class="row">
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="coin-banner-left">
                        <h1>
                            <span> SUPPORTED</span> COINS<span>.</span>
                        </h1>
                        <P class="para-text">Accept payments in Bitcoin, Ethereum, and various other cryptocurrencies by
                            utilizing the Eco Banx payment gateway. This service enables you to easily accept a wide
                            range of digital currencies for your transactions.</P>

                        <a href="https://Hashcodex.global/buy-crypto?asset=APE_ERC20" class=" crypto-coin-link">
                            <span class="wallet-link">Buy Crypto</span>
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                            </svg>

                        </a>
                    </div>

                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="coin-banner-right">
                        <img src="{{ url('/outerpage-assert/image/our-crypto-selection.png') }}" alt="crypto-selection"
                            class="img-fluid">

                    </div>

                </div>


            </div>
        </div>
    </section>

    <section class="our-portfolio">
        <div class="contain-width">
            <!-- <div class="our-port-crypto">
                <span> <img src="{{ url('/outerpage-assert/image/four-star.svg') }}"></span>
                <span>CRYPTOCURRENCIES</span>
            </div>

            <h3>Our Portfolio</h3> -->

            <div class="flip-card-container">
                <!-- Bitcoin Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">BITCOIN.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-bitcoin.png') }}" alt="bitcoin"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">BITCOIN.</h3>
                                <p>
                                    A decentralized digital currency created in 2009, using blockchain
                                    technology for secure transactions without intermediaries. It has a capped
                                    supply of 21 million coins and is often viewed as a digital store of value.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ethereum Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">ETHEREUM.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-ethereum.png') }}" alt="ETHEREUM"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">ETHEREUM.</h3>
                                <p>
                                    Created in 2015 by Vitalik Buterin, is a decentralized platform that enables smart
                                    contracts and decentralized
                                    applications (dApps) using its native cryptocurrency, Ether (ETH).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Litecoin Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">LITECOIN.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-litecoin.png') }}" alt="LITECOIN"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">LITECOIN.</h3>
                                <p>
                                    Created in 2011 by Charlie Lee, is a decentralized digital currency known for faster
                                    transaction times and lower fees
                                    than Bitcoin.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Ripple Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">RIPPLE.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-solana.png') }}" alt="RIPPLE"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">RIPPLE.</h3>
                                <p>
                                    Created in 2012, is a digital payment protocol and cryptocurrency (XRP) enabling
                                    fast, low-cost international money
                                    transfers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- EURST Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">EURST.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-eurst.png') }}" alt="EURST"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">EURST.</h3>
                                <p>
                                    A stablecoin pegged to the euro, designed to maintain a stable value and facilitate
                                    digital transactions and
                                    international transfers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Solana Card -->
                <div class="flip-card">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">SOLANA.</h3>
                                <div class="portfolio-img">
                                    <img src="{{ url('/outerpage-assert/image/port-solana.png') }}" alt="SOLANA"
                                        class="img-fluid" width="265" height="265">
                                </div>
                                <div class="add-portfolio">
                                    <img src="{{ url('/outerpage-assert/image/our-portfolio-add.svg') }}"
                                        alt="Portfolio">
                                </div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="our-portfolio-block card-block">
                                <h3 class="card-sub-title">SOLANA.</h3>
                                <p>
                                    Solana (SOL) is the native cryptocurrency of the Solana blockchain, known for its
                                    fast transaction speeds and low fees.
                                    It powers decentralized applications (dApps) and decentralized finance (DeFi)
                                    projects within the Solana ecosystem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div class="all-support">
                <a href="{{url('/all-supported-coins')}}" class="crypto-coin-link">
                    <span class="wallet-link">ALL SUPPORTED COINS</span>
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
    </section>

    <section class="crypto-processing crypto-bg">
        <div class="contain-width">
            <h2>Try the Crypto Processing of the future today <span>.</span></h2>
            <div class="row">
                <div class="col-xl-1"></div>
                <div class="col-xl-5 col-lg-6 col-md-6 col-sm-12">
                    <div class="crypto-process-block">
                        <h4>BE THE<span> FIRST </span> !</h4>
                        <p>to Follow us at x.com for all the latest news</p>
                        <a href="https://x.com/Hashcodex_official" class=" crypto-coin-link">
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                            </svg>

                        </a>
                    </div>
                </div>
                <div class="col-xl-5 col-lg-6 col-md-6 col-sm-12">
                    <div class="crypto-process-block">

                        <h4><span> NEED </span>HELP ?</h4>
                        <p>Follow us at x.com for all the latest news</p>
                        <a href="https://Hashcodex.global/contact-us" class=" crypto-coin-link">
                            <svg width="27" height="27" viewBox="0 0 27 27" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.3125 8.06641L19.248 13.0019L14.3125 17.9374" stroke="#0047FF"
                                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M19.2499 13L8.75 13" stroke="#0047FF" stroke-width="2" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <circle cx="13.5" cy="13.5" r="13" stroke="#0047FF" />
                            </svg>

                        </a>
                    </div>
                </div>
                <div class="col-xl-1"></div>

            </div>
        </div>
    </section>

</main>


@include('layouts.outerfooter')