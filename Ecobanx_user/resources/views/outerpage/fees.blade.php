@php
$title = 'Fees';
$atitle = 'fees';
@endphp



@include('layouts.outerheader')


<main class="fee-page">
    <section class="banner-section crypto-bg">
        <div class="contain-width">
            <div class="row">
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="fee-banner-left">
                        <h1>ONE
                            <span> SIMPLE</span> TRANSACTION FEE<span>.</span>
                        </h1>
                        <P class="para-text">We like to keep things easy. Our pricing is as simple as it gets. One low
                            transaction fee for all incoming payments.</P>

                        <P> * A 1% fee is charged on incoming token payments instead. Fee adjustments may apply to
                            customers in high-risk
                            industries.</P>


                    </div>

                </div>
                <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                    <div class="fee-banner-right">
                        <img src="{{ url('/outerpage-assert/image/fee-banner.png') }}" alt="FEE-tool" class="img-fluid">

                    </div>

                </div>


            </div>
        </div>
    </section>
    <section class="income-payment">
        <div class="contain-width">
            <div class="crypto-sub-head">
                <span> <img src="{{ url('/outerpage-assert/image/four-star.svg') }}"></span>
                <span>PAYMENTS</span>
            </div>

            <h2><span>Incoming </span>Payments <span>.</span></h2>

            <div class="row fees-cards">
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card">
                        <h3 class="card-sub-title">To Balance<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Payments are deposited to your wallet.
                            </p>

                            <p class="card-bottom-text">0.5% Fee</p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/income-pay-1.svg') }}" alt="payment">
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card top-margin">
                        <h3 class="card-sub-title">ASAP<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Payments are forwarded to an external address.


                            </p>

                            <p class="card-bottom-text">0.5% + Network Fee</p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/income-pay-2.svg') }}" alt="payment">
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card">
                        <h3 class="card-sub-title">Nightly<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Payments are accumulated and forwarded to an address in one nightly batch.


                            </p>

                            <p class="card-bottom-text">0.5% + Network Fee</p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/income-pay-3.svg') }}" alt="payment">
                        </div>
                    </div>
                </div>
            </div>
            <p class="para-text">Payout modes which require conversions have an additional 0.1% fee. Due to increased
                Ethereum prices we have had to
                implement a variable fee to help subsidize gas costs, this amount is added to both the order total the
                buyer pays and
                the payment fee so as a merchant it may look like you are paying more than a 1% payment fee, however the
                fee you are
                paying is the same.</p>

        </div>

    </section>
    <section class="wallet-services">
        <div class="contain-width">

            <h2><span>Wallet </span>Service <span>.</span></h2>

            <div class="row fees-cards">
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card">
                        <h3 class="card-sub-title">Deposits<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Receive Cryptocurrency into your wallet.

                            </p>

                            <p class="card-bottom-text">FREE<span> for the first $15,000/month </span>(0.5% after that)
                            </p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/wallet-serices-1.svg') }}" alt="Deposits">
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card top-margin">
                        <h3 class="card-sub-title">Conversions<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Convert one Cryptocurrency into another.




                            </p>

                            <p class="card-bottom-text">Conversion Partner Fee + Network Fee</p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/wallet-serices-2.svg') }}" alt="Conversions">
                        </div>
                    </div>
                </div>
                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-12">
                    <div class="fee-card-block card-block card">
                        <h3 class="card-sub-title">Withdrawals<span>.</span></h3>

                        <div class="fee-block-content">
                            <p>Send Cryptocurrency from your wallet to any address.




                            </p>

                            <p class="card-bottom-text">Network Fee</p>
                        </div>


                        <div class="fee-card-img">
                            <img src="{{ url('/outerpage-assert/image/wallet-serices-3.svg') }}" alt="Withdrawals">
                        </div>
                    </div>
                </div>
            </div>


        </div>

    </section>
    <section class="about-network">
        <div class="contain-width">
            <h2><span>ABOUT</span> NETWORK FEES<span>.</span></h2>
            <p class="para-text">
                We do not charge any withdrawal fees to use the Eco Banx Pay wallet. However in order to send
                cryptocurrency, you need to
                pay a network fee to the cryptocurrency miners. Network fees vary based on which cryptocurrency you are
                trying to send
                and how busy the networks are.
            </p>
            <div class="withdraw-network-fee">
                <h3>Current Withdrawal/Network Fees</h3>


                <div class="fee-search-box">
                    <input type="text" id="feeInput" class="fee-table-search" onkeyup="myFunction()"
                        placeholder="Filter by search" title="Filter by search">
                </div>
                <div class="row withdraw-network-fee-tables">
                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <div class="withdraw-network-table card-block">
                            <table id="feeTable" class="table table-1 table-borderless">
                                <thead>
                                    <tr class="fee-header">
                                        <th>Currency</th>
                                        <th>TX Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="fee-currency">
                                                <span class="currency-icon"><img
                                                        src="{{ url('/outerpage-assert/image/btc.svg') }}"
                                                        alt="btc"></span><span>Bitcoin  BTC</span>
                                            </div>
                                        </td>

                                        <td>0.0004</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"><img
                                                        src="{{ url('/outerpage-assert/image/usdc.svg') }}"
                                                        alt="usdc"></span><span>USDC</span></div>
                                        </td>
                                        <td>0.0001</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/usdt.svg') }}"
                                                        alt="usdt"></span><span>USDT</span></div>
                                        </td>
                                        <td>0.0001</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/shib.svg') }}"
                                                        alt="Shiba-Inu-SHIB"></span><span>Shiba Inu SHIB</span></div>
                                        </td>
                                        <td>1,820,000</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/ada.svg') }}"
                                                        alt="Cardano-ADA"></span><span>Cardano ADA</span></div>
                                        </td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/sol.svg') }}"
                                                        alt="Solana-SOL"></span><span>Solana SOL</span></div>
                                        </td>
                                        <td>0.0001</td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/trx.svg') }}"
                                                        alt="TRX"></span><span>TRX</span></div>
                                        </td>
                                        <td>2</td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/matic.svg') }}"
                                                        alt="matic"></span><span>MATIC</span></div>
                                        </td>
                                        <td>0.002</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                        <div class="withdraw-network-table card-block">
                            <table id="feeTable" class="table table-2 table-borderless">
                                <thead>
                                    <tr class="fee-header">
                                        <th>Currency</th>
                                        <th>TX Fee</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            <div class="fee-currency">
                                                <span class="currency-icon"><img
                                                        src="{{ url('/outerpage-assert/image/eurst.svg') }}"
                                                        alt="eurst"></span><span>EURST </span>
                                            </div>
                                        </td>

                                        <td>0.004</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"><img
                                                        src="{{ url('/outerpage-assert/image/busd.svg') }}"
                                                        alt="busd"></span><span>Binance
                                                    BUSD</span></div>
                                        </td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/eth.svg') }}"
                                                        alt="eth"></span><span>Etherium  ETH</span> </div>
                                        </td>
                                        <td>0.004</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/avax.svg') }}"
                                                        alt="avax"></span><span>Avalanche AVAX</span></div>
                                        </td>
                                        <td>0.01</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/dash.svg') }}"
                                                        alt="dash"></span><span>Dash  DASH</span></div>
                                        </td>
                                        <td>0.003</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/dogecoin.svg') }}"
                                                        alt="dogecoin"></span><span>Dogecoin  DOGE</span></div>
                                        </td>
                                        <td>6</td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/xrp.svg') }}"
                                                        alt="XRP"></span><span>XRP</span></div>
                                        </td>
                                        <td>3</td>
                                    </tr>

                                    <tr>
                                        <td>
                                            <div class="fee-currency"><span class="currency-icon"> <img
                                                        src="{{ url('/outerpage-assert/image/ton.svg') }}"
                                                        alt="Ton"></span><span>TON</span></div>
                                        </td>
                                        <td>0.01</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                <div class="fee-bottom-link">
                    <a href="{{url('/all-supported-coins')}}" class="crypto-coin-link">
                        <span class="wallet-link">ALL SUPPORTED COINS </span>

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
    </section>
</main>

@include('layouts.outerfooter')