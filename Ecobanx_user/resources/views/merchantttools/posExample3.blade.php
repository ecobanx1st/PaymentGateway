@php $title = "Pos Button"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="paymentstepsbg">
    <div class="container">
        <div class="row">
            <div class="stepsbanner">
                <div class="logo text-center">
                    <img src="{{ url('img/logo.png') }}" alt="logo">
                </div>
            </div>
            <div class="col-lg-8 col-md-8 col-sm-6 col-xs-12 boxb mx-auto">
                <div class="stepsbanner">
                    <div class="qrcode text-center">
                        <img src="{{ url('img/cancel-qrcode.png') }}" alt="logo">
                    </div>
                    <h4 class="headtxt text-center">Eco Banx Support</h4>

                    <!-- <p class="t-black mb-0">Scan the QR Code, or copy and paste the payment details into your wallet.</p> -->
                    <!-- <p class="t-black mb-0 text-center">Make sure to send enough to cover any coin transaction fees!</p> -->
                    <!-- <p class="borderline text-center"><span>Or</span></p> -->
                    <div class="paymenttable">
                        <div class="form-group">
                            <label>Amount</label>
                            <div class="input-group">
                                <button type="button" class="form-control text-start" fdprocessedid="kl62qe"><span
                                        class="me-2" id="coinaddress">89.00000000 </span> BTC </button>
                                <span class="input-group-text" id="myTooltip" onclick="copy_text()"><i
                                        class="fa fa-copy qrcopyicon"></i></span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <div class="input-group">
                                <input type="text" class="form-control" id="coinaddress1" value="" readonly=""
                                    fdprocessedid="f3mpcp"> <span class="input-group-text" id="myTooltip1"
                                    onclick="myCopyFunc1('1')"><i class="fa fa-copy qrcopyicon"></i></span>
                            </div>
                        </div>
                        <div class="text-center">
                            <h4 class="headtxt text-start">Payment Process</h4>
                            <div class="timerbox">
                                <span class="timerborder strclock" id="strclock"><span class="clock-bg">08</span>:<span
                                        class="clock-bg">26</span>:<span class="clock-bg">57</span></span>
                                <span class="infoicon"><i class="fa fa-info-circle"></i><label>Time Left</label></span>
                            </div>
                        </div>
                    </div>

                    <p class="feess">Make sure to send enough to cover any coin transaction fees!</p>
                    <p class="feess">Payment ID: BBT027832cbaeca0c688fd5737c30f7cc9c</p>

                    <div class="form-group text-center">
                        <form method="post" action="" autocomplete="off">
                            <input type="hidden" name="_token" value="QEV8J0PE81wdRdQ7Kzg2Pk908vXLN9Tw1AoVuc92">
                            <input type="hidden" name="invoice_id"
                                value="eyJpdiI6IjdIeHkzRGczeE16ZVh5bkticWZ6c3c9PSIsInZhbHVlIjoibDNodFJyT3BVWVhPNjhwTmc4VHJpQT09IiwibWFjIjoiNjQwOTcxYTJhZGZhNzg1ZWJkOGUyMjJjMzVjYzIzNzUzN2EzMzA3NGUzMWQxZGY4ZDRmZGRiM2U3Yjc4YjlkZSJ9">
                            <input type="hidden" name="payment_id"
                                value="eyJpdiI6InFnRFZLOEY5WmUyTURXcHN4XC9qb01nPT0iLCJ2YWx1ZSI6IkpoY1MxTUtvejdFZ1k3YkVBVUx5MHlqOXV3ZEp5MVkzelJUUHZDY1wvcStxMVFyK2ZJdUk2NnR2UEJHcEsrQWZLIiwibWFjIjoiNDY2OWRiZDQ5ZTFjYTk4ZmM5YjgxNDExZmNkYTdkMzUxNzJhZDY4MzhlZTNmYmQxZTAxZjM3ZWIyMDExNjA5MiJ9">

                        </form>
                    </div>

                </div>
                <!-- 
        <div class="stepsbanner payment-qust">
          <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
            <div class="">
              <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="headingOne">
                  <h4 class="panel-title"> <a role="button" class="collapsed" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapseOne" aria-bs-expanded="true" aria-bs-controls="collapseOne" aria-expanded="false"><i class="fa fa-angle-down"></i> What to do next? </a></h4> </div>
                  <div id="collapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOne" style="word-break: break-word;">
                    <div class="panel-body">
                      <p class="content">1) Please send 89.00000000 BTC to address . (Make sure to send enough to cover any coin transaction fees!) You will need to initiate the payment using your software or online wallet and copy/paste the address and payment amount into it. We will email you when all funds have been received. You have 5 hours for us to receive confirmed funds. If you send funds that don't confirm by the timeout or don't send enough coins you will receive an automatic email to claim your funds within 8 hours. If you don't receive the email contact us with the information below and dtspay will send you a refund:</p>
                      <ul class="content">
                        <li>A payment address to send the funds to.</li>
                      </ul>
                      <p class="content">2) After sending payment, review the status of your transaction. Once the payment is confirmed, then payment will be completed and the merchant will be notified. The confirmation process usually takes 10-45 minutes but varies based on the coin's target block time and number of confirms required. The status page is available for the next 5 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="">
                <div class="panel panel-default">
                  <div class="panel-heading" role="tab" id="headingTwo">
                    <h4 class="panel-title"> <a class="collapsed" role="button" data-bs-toggle="collapse" data-bs-parent="#accordion" href="#collapseTwo" aria-bs-expanded="false" aria-bs-controls="collapseTwo"><i class="fa fa-angle-down"></i> What if I accidentally don't send enough? </a></h4> </div>
                    <div id="collapseTwo" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingTwo">
                      <div class="panel-body">
                        <p class="content">If you don't send enough, that is OK. Just send the remainder and we will combine them for you. You can also send from multiple wallets/accounts.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> -->

                <div class="row">
                    <div class="col-md-12">
                        <div class="form-group cancel-btn">
                            <button type="submit" id="save_btn" class="btn btn-green" fdprocessedid="7a9nw6">Cancel
                                Payment</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>


<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation.js') }}"></script>

<script>
$(document).ready(function() {

    $('.extras').click(function() {

        $('.profile-list').toggleClass('showing')

    });

    $('.more-menu-bottom').click(function() {

        $('.extra-menu-mobile').toggleClass('showall-extramenus')

    })

})
</script>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</body>

</html>