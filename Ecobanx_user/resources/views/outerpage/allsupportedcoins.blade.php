@php
$title = 'Supported Coins';
$atitle = 'support coins';
@endphp

@include('layouts.outerheader')

<main class="supported-coin-page">
    <section class="all-supported-banner crypto-bg">
        <div class="contain-width">
            <h1>

                <span> SUPPORTED</span> COINS<span>.</span>
            </h1>
            <p>Store, send and receive all popular cryptocurrencies in your wallet. Accept Bitcoin payments, Ethereum
                payments and payments in other cryptocurrencies through the Eco Banx Pay payment gateway.</p>
        </div>


    </section>

    <section class="supported-table">
        <div class="contain-width">
            <div class="supported-coin-table table-responsive">
                <table class="table ">
                    <thead>
                        <tr class="supported-coin-header">
                            <th>NAME</th>
                            <th>CURRENT PRICE</th>
                            <th>24H CHANGE</th>
                            <th>24h VOLUME</th>
                            <th>MARKET CAP</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($coinslists as $coinlist)
                        <tr>
                            <td>
                                <div class="coin-name">
                                    <span class="assets-crypto-logo"><img src="{{ url($coinlist->image) }}"
                                            alt="{{ $coinlist->source }}" /></span>
                                    <span>
                                        {{ $coinlist->source }}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div class="coin-value">

                                    € {{ display_format($coinlist->eur_price,$coinlist->eur_decimal,1) }}
                                </div>
                            </td>
                            <td>
                                <div class="coin-change-24h change-up">
                                    <span class="triangle-up"><svg width="16" height="14" viewBox="0 0 16 14"
                                            fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 0L15.7942 13.5H0.205771L8 0Z" fill="#2BE0E0" />
                                        </svg>
                                    </span>
                                    @if(!empty($coinlist->volume_change_24h))
                                    {{ display_format($coinlist->volume_change_24h,2) }}
                                    @else
                                    <span class="price_change_{{$coinlist->source}}EUR">0.00%</span>
                                    @endif

                                </div>
                            </td>
                            <td>
                                <div class="coin-value">
                                    @if(!empty($coinlist->volume_24h))
                                    {{ display_format($coinlist->volume_24h,2,1) }}
                                    @else
                                    <span class="volumecap_{{  $coinlist->source }}EUR"></span><span
                                        class="volumecap_EUR{{  $coinlist->source }}">000.00</span>
                                    @endif
                                </div>
                            </td>
                            <td>
                                <div class="coin-value">
                                    @if(!empty($coinlist->market_cap))
                                    {{ display_format($coinlist->market_cap,2,1) }}
                                    @else
                                    <span class="quote_{{  $coinlist->source }}EUR"></span><span
                                        class="quote_EUR{{  $coinlist->source }}">000.00</span>
                                    @endif

                                </div>
                            </td>
                            <td>
                                <a class="coin-buy"
                                    href="https://Hashcodex.global/buy-crypto?asset=@if($coinlist->assertype =='coin'){{  $coinlist->source }} @else{{  $coinlist->source."_ERC20" }} @endif">
                                    <span>BUY</span>
                                    <span><i class="fa-solid fa-arrow-right"></i></span>
                                </a>
                            </td>
                        </tr>
                        @empty
                        @endforelse
                </table>
            </div>


            <p class="note">This page provides real-time data on cryptocurrency prices, trading volumes, and market
                capitalizations
                on Eco Banx . Users
                can quickly access key information and navigate to trade pages. The data is for informational purposes
                only, sourced
                from third-party providers, and comes with a general risk warning.</p>

        </div>

    </section>

</main>


@include('layouts.outerfooter')
<script type="text/javascript">
$(document).ready(function() {
    // return;
    var conn = new WebSocket("wss://stream.binance.com:9443/ws");
    conn.onopen = function(evt) {
        var cpair = 'BTCUSDT';
        var array_dta = [];

        @forelse($coinslists as $pairlist)
        var bpair = '{{ strtolower(trim($pairlist->source.'
        eur ')) }}';
        var bpair1 = '{{ '
        eur '.strtolower(trim($pairlist->source)) }}';
        array_dta1 = [bpair + "@ticker"];
        array_dta2 = [bpair1 + "@ticker"];
        array_dta1.forEach(function(item) {
            array_dta.push(item);
        })
        array_dta2.forEach(function(item) {
            array_dta.push(item);
        })
        @empty
        var bpair = 'btcusdt';
        array_dta1 = [bpair + "@ticker"];
        array_dta1.forEach(function(item) {
            array_dta.push(item);
        })
        @endforelse

        var messageJSON = {
            "method": "SUBSCRIBE",
            "params": array_dta,
            "id": 1
        };

        conn.send(JSON.stringify(messageJSON));
    }


    conn.onmessage = function(evt) {
        if (evt.data) {
            var get_data = JSON.parse(evt.data);
            console.log(get_data)
            if ((typeof get_data['e'] == "24hrTicker") || (get_data['e'] != null)) {
                var last_price = get_data['c'];
                var high_price = get_data['h'];
                var low_price = get_data['l'];
                var open_price = get_data['o'];
                var price_change = get_data['P'];
                var quote = get_data['v'];
                var symbol = get_data['s'];
                var volumecap = get_data['Q'];

                var is_data = "t-red";
                var waveimg = "";
                if (price_change > 0) {
                    is_data = "t-green";
                    waveimg = "";
                }

                if ((typeof last_price != 'undefined')) {
                    $('.last_price_' + symbol).html(parseFloat(last_price + '$'.toString()));
                }

                if ((typeof quote != 'undefined') && (typeof last_price != 'undefined')) {
                    $('.quote_' + symbol).html(parseFloat(quote + '$'.toString()));
                }
                if ((typeof open_price != 'undefined') && (typeof last_price != 'undefined')) {
                    $('.open_' + symbol).html(parseFloat(open_price.toString()));
                }
                if ((typeof low_price != 'undefined') && (typeof last_price != 'undefined')) {
                    $('.low_' + symbol).html(parseFloat(low_price.toString()));
                }
                if ((typeof high_price != 'undefined') && (typeof last_price != 'undefined')) {
                    $('.high_' + symbol).html(parseFloat(high_price.toString()));
                }
                if ((typeof volumecap != 'undefined') && (typeof volumecap != 'undefined')) {
                    $('.volumecap_' + symbol).html(parseFloat(volumecap.toString()));
                }

                // return;

                if ((typeof price_change != 'undefined') && (typeof last_price != 'undefined')) {
                    price_change = price_change * 1;
                    price_change = price_change.toFixed(2);
                    $('.price_change_' + symbol).html('<span class="' + is_data + '">' + parseFloat(
                        price_change).toFixed(2) + '% </span>');
                }

                $('.waveimg_' + symbol).html('<img src="' + waveimg + '">');

            }
        }
    }
});
</script>