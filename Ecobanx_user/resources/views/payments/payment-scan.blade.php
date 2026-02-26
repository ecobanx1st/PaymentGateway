@php $title = "Payment Scan"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
    <div class="container">
        <div class="row">
            <div class="stepsbanner">
                <div class="logo text-center">
                    <img src="{{ url('img/logo.png') }}" alt="logo" width="120px">
                </div>
            </div>
            <div class="col-lg-8 col-md-8 col-sm-6 col-xs-12 boxb mx-auto">
                <div class="stepsbanner">
                    <div class="qrcode text-center">
                        @if(!empty($order->payment_address))
                        {!! QrCode::size(180)->generate($order->payment_address) !!}
                        @endif
                    </div>
                    <h4 class="headtxt text-center">Eco Banx Demo Support</h4>
                    <div class="paymenttable">
                        <div class="form-group">
                            <label>Amount</label>
                            <div class="input-group">
                                <button type="button" class="form-control text-start" fdprocessedid="kl62qe"><span
                                        class="me-2" id="coinaddress">{{ $order->amount2 }} </span>
                                    {{ $order->currency2 }} </button>
                                <span class="input-group-text" id="myTooltip" onclick="copy_text()"><i
                                        class="fa fa-copy qrcopyicon"></i></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="coinaddress1"
                                    value="{{ $order->payment_address }}" readonly=""> <span class="input-group-text"
                                    id="myTooltip1" onclick="myCopyFunc1('{{ $order->payment_address }}')"><i
                                        class="fa fa-copy qrcopyicon"></i></span>
                            </div>
                        </div>
                        <div class="text-center">
                            <h4 class="headtxt text-start">Payment Process</h4>
                            <div class="timerbox">
                                <span class="timerborder strclock" id="strclock"><span class="clock-bg">05</span>:<span
                                        class="clock-bg">00</span>:<span class="clock-bg">00</span></span>
                                <span class="infoicon"><i class="fa fa-info-circle"></i><label>Time Left</label></span>
                            </div>
                        </div>
                    </div>

                    <p class="feess">Make sure to send enough to cover any coin transaction fees!</p>
                    <p class="feess">Payment ID: {{ $order->txn_id }}</p>
                </div>

                <div class="stepsbanner payment-qust">
                    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
                        <div class="">
                            <div class="panel panel-default">
                                <div class="panel-heading" role="tab" id="headingOne">
                                    <h4 class="panel-title"> <a role="button" class="collapsed"
                                            data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapseOne"
                                            aria-bs-expanded="true" aria-bs-controls="collapseOne"
                                            aria-expanded="false"><i class="fa fa-angle-down"></i> What to do next? </a>
                                    </h4>
                                </div>
                                <div id="collapseOne" class="panel-collapse collapse" role="tabpanel"
                                    aria-labelledby="headingOne" style="word-break: break-word;">
                                    <div class="panel-body">
                                        <p class="content">1) Please send {{ $order->amount2 }} {{ $order->currency2 }}
                                            to address {{ $order->payment_address }}. (Make sure to send enough to cover
                                            any coin transaction fees!) You will need to initiate the payment using your
                                            software or online wallet and copy/paste the address and payment amount into
                                            it. We will email you when all funds have been received. You have 5 hours,
                                            01 minutes,29 seconds for us to receive confirmed funds. If you send funds
                                            that don't confirm by the timeout or don't send enough coins you will
                                            receive an automatic email to claim your funds within 8 hours. If you don't
                                            receive the email contact us with the information below and
                                            paymentgatewaydemoment will send you a refund:</p>
                                        <ul class="content">
                                            <li>The transaction ID: {{ $order->txn_id }}</li>
                                            <li>A payment address to send the funds to.</li>
                                        </ul>
                                        <p class="content">2) After sending payment, review the status of your
                                            transaction. Once the payment is confirmed several times in the block chain,
                                            the payment will be completed and the merchant will be notified. The
                                            confirmation process usually takes 10-45 minutes but varies based on the
                                            coin's target block time and number of block confirms required. The status
                                            page is available for the next 30 days.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="">
                            <div class="panel panel-default">
                                <div class="panel-heading" role="tab" id="headingTwo">
                                    <h4 class="panel-title"> <a class="collapsed" role="button"
                                            data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapseTwo"
                                            aria-bs-expanded="false" aria-bs-controls="collapseTwo"><i
                                                class="fa fa-angle-down"></i> What if I accidentally don't send enough?
                                        </a></h4>
                                </div>
                                <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel"
                                    aria-labelledby="headingTwo">
                                    <div class="panel-body">
                                        <p class="content">If you don't send enough, that is OK. Just send the remainder
                                            and we will combine them for you. You can also send from multiple
                                            wallets/accounts.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group cancel-btn">
                            @php $cancelurl = url('cancel-payment/'.$order->txn_id); @endphp
                            <a class="text-center btn sitebtn" href="{{ url('cancel-payment/'.$order->txn_id) }}">Cancel
                                Payment</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>


<scriptsrc="https: //cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js">
    </scriptsrc=>

    <script>
    $(document).ready(function() {

        $('h4.panel-title a').click(function() {

            $(this).parent('.collapse').removeClass('show');

        });

    });
    </script>

    <script src="{{ url('js/validation.js') }}"></script>
    <script>
    setInterval(ajaxCall, 5000); //300000 MS == 5 minutes

    function ajaxCall() {
        var csrf = $('meta[name="csrf-token"]').attr('content');
        $.ajax({
            url: "{{ url('payment_success/') }}",
            type: 'POST',
            data: {
                item_id: '<?php echo $order->txn_id;?>',
                '_token': csrf
            },
            dataType: 'json',
            success: function(data) {
                if (data.status == 'success') {
                    window.location.href = data.url;
                }
            }
        })
    }
    </script>

    <?php
$endd= date('Y-m-d H:i:s', strtotime('+5 hours', strtotime($order->created_at)));
$datetime1 = new DateTime();
$datetime2 = new DateTime($endd);
$interval = $datetime1->diff($datetime2);
?>
    <script>
    var hour = <?php echo $interval->format(' %h '); ?>;
    var min = <?php echo $interval->format(' %i '); ?>;
    var sec = <?php echo $interval->format(' %s '); ?>;

    function countdown() {
        if (sec <= 0 && min > 0) {
            sec = 60;
            min -= 1;
        } else if (min <= 0 && sec <= 0) {
            min = 0;
            sec = 0;
        } else {
            sec -= 1;
        }
        if (min <= 0 && hour > 0) {
            min = 60;
            hour -= 1;
        }
        var pat = /^[0-9]{1}$/;
        secs = (pat.test(sec) == true) ? '0' + sec : sec;
        mins = (pat.test(min) == true) ? '0' + min : min;
        hours = (pat.test(hour) == true) ? '0' + hour : hour;

        document.getElementById('strclock').innerHTML = hours + ":" + mins + ":" + secs;

        var time = document.getElementById('strclock').innerHTML;
        if (time == '00:00:00') {

            window.location.href = '<?php echo  $cancelurl; ?>';
        } else {
            setTimeout("countdown()", 1000);
        }
    }
    countdown();

    function myCopyFunc() {
        var copyText = document.getElementById("coinaddress");
        copyText.select();
        document.execCommand("Copy");
        var tooltip = document.getElementById("basic-addon1");
        tooltip.innerHTML = "<strong class='text-danger'>Copied!</strong>";
    }
    </script>


    </body>

    </html>