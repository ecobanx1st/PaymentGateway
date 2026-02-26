
@include('layouts.outerheader')

<section class="buy-crypto banner-section crypto-bg">
        <div class="contain-width">
            <div class="buy-crypto-block">
                <div class="row">
                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <div class="buy-crypto-left">
                            <h1><span> BUY </span>CRYPTO EASILY<span>.</span></h1>

                            <p class="para-text">Buy securely with card or instant bank transfer</p>
                            <ul>
                                <li>
                                    Excellent market prices

                                </li>
                                <li>Instant SEPA and FPS transfers</li>
                                <li> Buy crypto by card</li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <div class="buy-crypto-right">
                            <div class="buy-crypto-logo">
                                <img src="{{ url('/outerpage-assert/image/Hashcodex-logo.png') }}" alt="buy-crypto">
                            </div>
                            <div class="crypto-pay-receive">
                                <label>pay</label>

                                <div class="pay-receive-block">
                                    <input type="text" value="1000" required>
                                    <div class="nav-item dropdown">

                                        <select class="pay-mode" aria-label="Default select example">
                                            <option selected="">EUR</option>
                                            <option value="1">One</option>
                                            <option value="2">Two</option>
                                            <option value="3">Three</option>
                                        </select>

                                    </div>
                                </div>

                                <label>Receive</label>

                                <div class="pay-receive-block">
                                    <input type="text" placeholder="Enter amount" required>
                                    <div class="nav-item dropdown">

                                        <select class="pay-mode" aria-label="Default select example">
                                            <option selected="">APE_ERC20</option>
                                            <option value="1">One</option>
                                            <option value="2">Two</option>
                                            <option value="3">Three</option>
                                        </select>

                                    </div>
                                </div>
                            </div>
                            <div class="buy-crypto-btn">
                                <a href="{{ url('/login') }}" class="blue-btn">Buy Crypto</a>
                            </div>
                            <div class="crypto-pay-methods">
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-1.svg') }}"></div>
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-2.svg') }}"></div>
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-3.svg') }}"></div>
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-4.svg') }}"></div>
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-5.svg') }}"></div>
                                <div class="pay-method"><img src="{{ url('/outerpage-assert/image/pay-type-6.svg') }}"></div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>
    </section>


@include('layouts.outerfooter')


