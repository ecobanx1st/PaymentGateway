@php $title = "API Documentation"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>


<section class="Dashboard-page">
  <div class="container-fluid">
     <div class="row">

      @include('layouts.menu')


        <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

               <div class="header-part-outer">

                <div class="common-header-style title-outer">
                  <div class="row">

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png" alt="logo"></a></div>
                    </div>

                    <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                      <div class="notify-part">
                        <div class="notify"><img src="img/Notification.png"></div>
                        <div class="message"><img src="img/message.png"></div>
                      </div>
                    </div>

                  </div>
                </div>

                <div class="head-title-part">
                  <h1>Shop Cart Button Example</h1>
                  <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                </div>

              </div>

              <article class="gridparentbox">
  <div class="container sitecontainer apipagebg">
    <div class="buttonmakerbg htmlpostbg">
      <div class="apibanner">
        <div class="row apiflexbox">
          <div class="col-lg-3 col-md-5 col-sm-12 col-12 apiciontenttext">
            <div class="apilistcontent">
              <div class="trustapibox">
                <h4>Basics</h4>
                <ul class="listsetup">
                  <li><a href="#" class="sc-sp-list">Introduction</a></li>
                  <li><a href="#" class="sc-sp-list">Get Authorized Token</a></li>
                </ul>
              </div>
              <div class="trustapibox">
                <h4>Informational Commands</h4>
                <ul class="listsetup">
                  <li><a href="#" class="sc-sp-list">Get Basic Account Info</a></li>
                  <li><a href="#" class="sc-sp-list">Get Coin Balances</a></li> 
                  <li><a href="#" class="sc-sp-list">Get Deposit Address</a></li> 
                </ul>   
              </div>
              <div class="trustapibox">
                <h4>Receiving Payments</h4>
                <ul class="listsetup">
                  <li><a href="#" class="sc-sp-list">Create Transaction</a></li>
                  <li><a href="#" class="sc-sp-list">Get TX Info</a></li> 
                  <li><a href="#" class="sc-sp-list">Get TX List</a></li> 
                </ul>   
              </div>
              <div class="trustapibox">
                <h4>Withdrawals</h4>
                <ul class="listsetup">
                  <li><a href="#" class="sc-sp-list">Make Withdrawal</a></li> 
                  <li><a href="#" class="sc-sp-list">Get Withdrawal History</a></li> 
                  <li><a href="#" class="sc-sp-list">Get Withdrawal Info</a></li> 
                </ul>   
              </div>
            </div>
          </div>
          <div class="col-lg-9 col-md-7 col-sm-12 col-12">
            <div class="sc-sp-data-dis">
              <h4>Basics</h4>
              <p><strong>Introduction</strong></p>
              <p>The Kryptonica API will provide access to our services and information to our sellers. API calls are implemented as standard HTTP POST (application/x-www-form-urlencoded) calls to https://kryptonica.net/api/</p>

              <p><strong>API Setup</strong></p>
              <p>The only setup needed is to go to the API Keys page and generate an API key. You will be given a private and public key used to authenticate your API calls. Make sure you don't share your private and public key with any other users!</p>
              <p><code>Note: If you forgot your private and public key, you can't access any API calls</code></p>

              <p><strong>Authentication</strong></p>
              <p>Every API call (Private API Calls) need access token that you have generated using private and public key. Our server generates it's own unique access token for every users.<br>If they don't match the API call is discarded. For example if your access token was "authorize token" and you were using the get_balance function the raw request might look like:</p>
              <p>
                <code>https://kryptonica.net/api/get_balance</code><br>
                and also you need to pass your access token in your header of every API calls except get_authorized_token API call. It may look like:<br><code>--header 'Authorization: {your_authorize_token}' \</code>
              </p>

              <p><strong>API Response</strong></p>
              <p>The API will return an array with 3 elements: 'status', 'response' and 'message'<br> The status will always return either 'true' or 'false'.<br> If the status will return 'true', then 'response' will return an array of object or object and 'message' will return an empty.<br> If the status will return 'false', then 'response' will return an empty and 'message' will return decription of error message.</p>

              <p><strong>API POST Fields</strong></p>
              <p>API calls are made as basic HTTP POST requests. (Note: The POST data is regular application/x-www-form-urlencoded style data)</p>

              <hr>
            </div>
            <div class="sc-sp-data-dis">
              <h4>Basics</h4>
              <p><strong>Get Authorized Token</strong></p>
              <pre>API URL : https://kryptonica.net/api/get_authorized_token</pre>
              <p><strong>Parameters</strong></p>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Mandatory</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Email ID</td>
                      <td>email</td>
                      <td>YES</td>
                      <td>The parameters should be like this, your registered email id</td>
                    </tr>
                    <tr>
                      <td>Public Key</td>
                      <td>public_key</td>
                      <td>YES</td>
                      <td>The parameters should be like this, pub_12DF12</td>
                    </tr>
                    <tr>
                      <td>Private Key</td>
                      <td>private_key</td>
                      <td>YES</td>
                      <td>The parameters should be like this, pvk_12DF12</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "authorize_token": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9mNvbVwvZHRz....."
    },
    "message": ""
}
            </pre>
            <p><strong>Failure Response</strong></p>
              <pre class="failed_pre">{
    "status": false,
    "response": "",
    "message": "Unauthorized!"
}
            </pre>

            <hr>
          </div>
          <div class="sc-sp-data-dis">
            <h4>Informational Commands</h4>
            <p><strong>Get Basic Account Info</strong></p>
            <pre>API URL : https://kryptonica.net/api/get_basic_info</pre>
            <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "username": "smith",
        "email": "smith*******ator.com",
        "merchant_id": "2f7a70*************01cd6"
    },
    "message": ""
}
            </pre>

          <hr>
        </div>
        <div class="sc-sp-data-dis">
          <h4>Informational Commands</h4>
          <p><strong>Get Coin Balances</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_balance</pre>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": [
        {
            "coin": "BTC",
            "available": "0.00000000",
            "locked": "0.00000000",
            "total": "0.00000000"
        },
        {
            "coin": "ETH",
            "available": "1.00000000",
            "locked": "0.00000000",
            "total": "1.00000000"
        },
        {
            "coin": "USDT",
            "available": "0.00000000",
            "locked": "0.00000000",
            "total": "0.00000000"
        },
        {
            "coin": "BUSD",
            "available": "0.00000000",
            "locked": "0.00000000",
            "total": "0.00000000"
        },
        {
            "coin": "USDC",
            "available": "0.00000000",
            "locked": "0.00000000",
            "total": "0.00000000"
        }
       
    ],
    "message": ""
}
            </pre>

          <hr>
        </div>
        <div class="sc-sp-data-dis">
          <h4>Informational Commands</h4>
          <p><strong>Get Deposit Address</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_deposit_address</pre>
          <p><strong>Parameters</strong></p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mandatory</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Symbol</td>
                  <td>currency</td>
                  <td>YES</td>
                  <td>The parameters should be like this, BTC, ETH</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "address": "18x***********4LFbkh"
    },
    "message": ""
}
            </pre>

        <hr>
      </div>
      <div class="sc-sp-data-dis">
        <h4>Receiving Payments</h4>
        <p><strong>Create Transaction</strong></p>
        <p>Note: This API is for making your own custom checkout page so buyers don't have to leave your website to complete payment. 99% of the time you don't need the extra complexity and would just use a Simple or Advanced button which you can find in our Merchant Tools section.</p>
        <pre>API URL : https://kryptonica.net/api/create_transaction</pre>
        <p><strong>Parameters</strong></p>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Mandatory</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
               <tr>
                <td>cmd</td>
                <td>cmd</td>
                <td>YES</td>
                <td>The parameters should be like this, simple or advanced</td>
              </tr>
              <tr>
                <td>Amount</td>
                <td>amount</td>
                <td>YES</td>
                <td>The amount of the transaction in the original currency (currency1 below).</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>currency1</td>
                <td>YES</td>
                <td>The original currency of the transaction.</td>
              </tr>
              <tr>
                <td>Currency</td>
                <td>currency2</td>
                <td>YES</td>
                <td>The currency the buyer will be sending. For example if your products are priced in BTC but you are receiving ETH, you would use currency1=BTC and currency2=ETH. currency1 and currency2 can be set to the same thing if you don't need currency conversion.</td>
              </tr>
              <tr>
                <td>Buyer Email</td>
                <td>buyer_email</td>
                <td>YES</td>
                <td>Set the buyer's email address. This will let us send them a notice if they underpay or need a refund. We will not add them to our mailing list or spam them or anything like that.</td>
              </tr>
              <tr>
                <td>Address</td>
                <td>address</td>
                <td>NO</td>
                <td>Optionally set the address to send the funds to (if not set will use the settings you have set on the 'Coins Acceptance Settings' page). Remember: this must be an address in currency2's network.</td>
              </tr>
              <tr>
                <td>Buyer Name</td>
                <td>buyer_name</td>
                <td>NO</td>
                <td>Optionally set the buyer's name for your reference.</td>
              </tr>
              <tr>
                <td>Item Name</td>
                <td>item_name</td>
                <td>YES</td>
                <td>Item name for your reference, will be on the payment information page and in the IPNs for the transaction.</td>
              </tr>
              <tr>
                <td>Item Number</td>
                <td>item_number</td>
                <td>YES</td>
                <td>Item number for your reference, will be on the payment information page and in the IPNs for the transaction.</td>
              </tr>
              <tr>
                <td>Invoice</td>
                <td>invoice</td>
                <td>YES</td>
                <td>Another field for your use, will be on the payment information page and in the IPNs for the transaction.</td>
              </tr>
              <tr>
                <td>IPN URL</td>
                <td>ipn_url</td>
                <td>YES</td>
                <td>URL for your IPN callbacks. If not set it will use the IPN URL in your Edit Settings page if you have one set.</td>
              </tr>
              <tr>
                <td>Success URL</td>
                <td>success_url</td>
                <td>YES</td>
                <td>Sets a URL to go to if the buyer does complete payment. (Only if you use the returned 'checkOut', no effect/need if designing your own checkout page.)</td>
              </tr>
              <tr>
                <td>Cancel URL</td>
                <td>cancel_url</td>
                <td>YES</td>
                <td>Sets a URL to go to if the buyer does not complete payment. (Only if you use the returned 'checkOut', no effect/need if designing your own checkout page.)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "original_amount": "0.1",
        "original_currency": "ETH",
        "selected_amount": "0.10000000",
        "selected_currency": "ETH",
        "address": "0xc4C6C******a830C4B",
        "payment_id": "Easy*******",
        "confirms_needed": 1,
        "timeout": 18000,
        "qrcode_url": "https://chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=0xc4C6C******a830C4B&amp;choe=UTF-8"
    },
    "message": ""
}
            </pre>

            <p><strong>Failure Response</strong></p>
              <pre class="failed_pre">{
    "status": false,
    "response": "",
    "message": "Unauthorized!"
}
            </pre>

    </div>
    <div class="sc-sp-data-dis">
          <h4>Receiving Payments</h4>
          <p><strong>Get TX Info</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_tx_info</pre>
          <p><strong>Parameters</strong></p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mandatory</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Invoice ID</td>
                  <td>invoice_id</td>
                  <td>YES</td>
                  <td>The parameters should be like this, EASY****</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "transaction_details": {
            "payment_id": "Easy6****6G54",
            "date_time": "28-01-2021 19:04:14",
            "status": "Payment completed successfully",
            "original_amount": "0.10000000",
            "original_currency": "ETH",
            "selected_amount": "0.10000000",
            "selected_currency": "ETH",
            "buyer_email": "smih****nator.com",
            "invoice": "123456",
            "item_name": "test",
            "item_number": "",
            "callback_url" : https://kryptonica.net/api/checkoutURL/{payment_id}
        },
        "payment_details": {
            "date_time": "28-01-2021 19:13:05",
            "from_address": "0x05****21b2b9f5",
            "to_address": "0xd135f****7d25e7d4",
            "amount": "1.00000000",
            "txn_id": "0xc33e******95156963"

        }
    },
    "message": ""
}
            </pre>

        <hr>
      </div>
      <div class="sc-sp-data-dis">
          <h4>Receiving Payments</h4>
          <p><strong>Get TX List</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_tx_list</pre>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "transaction_details": [
            {
                "payment_id": "Easy6****6G54",
                "date_time": "28-01-2021 19:04:14",
                "status": "Payment completed successfully",
                "original_amount": "0.10000000",
                "original_currency": "ETH",
                "selected_amount": "0.10000000",
                "selected_currency": "ETH",
                "buyer_email": "smih****nator.com",
                "invoice": "123456",
                "item_name": "test",
                "item_number": ""
            }
        ]
    },
    "message": ""
}
            </pre>

        <hr>
      </div>
      <div class="sc-sp-data-dis">
          <h4>Withdrawals</h4>
          <p><strong>Make Withdrawal</strong></p>
          <pre>API URL : https://kryptonica.net/api/withdraw</pre>
          <p><strong>Parameters</strong></p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mandatory</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Currency</td>
                  <td>currency</td>
                  <td>YES</td>
                  <td>The parameters should be like this, BTC, ETH</td>
                </tr>
                <tr>
                  <td>Withdrawal Address</td>
                  <td>address</td>
                  <td>YES</td>
                  <td>The parameters should be like this, xxxxxxxxx (If you want to send amount to multiple address then format should be address1,address2,address3)</td>
                </tr>
                <tr>
                  <td>Withdrawal Amount</td>
                  <td>amount</td>
                  <td>YES</td>
                  <td>The parameters should be like this, 0.001 (If you want to send amount to multiple address then format should be 0.001,0.002,0.003)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "reference_id": "a8651000XXXXXXX8e562e"
    },
    "message": "Withdraw has been successfully sent. Your request will be confirmed within few minutes to over 10 minutes."
}
            </pre>

             <p><strong>Failure Response</strong></p>
              <pre class="failed_pre">{
    "status": false,
    "response": "",
    "message": "Currency not available!"
}
            </pre>

        <hr>
      </div>
      <div class="sc-sp-data-dis">
          <h4>Withdrawals</h4>
          <p><strong>Get Withdrawal History</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_withdraw_history</pre>
          <p><strong>Parameters</strong></p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mandatory</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Currency</td>
                  <td>currency</td>
                  <td>YES</td>
                  <td>The parameters should be like this, BTC, ETH</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": [
        {
            "withdraw_id": "your_withdrawal_id",
            "txn_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
            "address": "16Fg*******zGasw5",
            "amount": "250.00000000",
            "fee": "0.00000000",
            "total": "250.00000000",
            "currency": "BTC",
            "status": "Rejected",
            "date_time": "21-01-2021 18:16:18"
        }
    ],
    "message": ""
}
            </pre>

             <p><strong>Failure Response</strong></p>
              <pre class="failed_pre">{
    "status": false,
    "response": "",
    "message": "Transaction not found!"
}
            </pre>

        <hr>
      </div>
      <div class="sc-sp-data-dis">
          <h4>Withdrawals</h4>
          <p><strong>Get Withdrawal Info</strong></p>
          <pre>API URL : https://kryptonica.net/api/get_withdraw_info</pre>
          <p><strong>Parameters</strong></p>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mandatory</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Currency</td>
                  <td>currency</td>
                  <td>YES</td>
                  <td>The parameters should be like this, BTC, ETH</td>
                </tr>
                <tr>
                  <td>Withdrawal ID</td>
                  <td>withdraw_id</td>
                  <td>YES</td>
                  <td>The parameters should be like this, 123456</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p><strong>Success Response</strong></p>
              <pre class="success_pre">{
    "status": true,
    "response": {
        "withdraw_id": "your_withdrawal-id",
        "txn_id": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "address": "16Fg2******zGasw5",
        "amount": "250.00000000",
        "fee": "0.00000000",
        "total": "250.00000000",
        "currency": "BTC",
        "status": "Rejected",
        "date_time": "21-01-2021 18:16:18"
    },
    "message": ""
}
            </pre>

             <p><strong>Failure Response</strong></p>
              <pre class="failed_pre">{
    "status": false,
    "response": "",
    "message": "Transaction not found!"
}
            </pre>

        <hr>
      </div>
  </div>
</div>
</div>
</div>
</div>
</article>

          
        </div>

     </div>
  </div>
</section>


<script>

  $(document).ready(function(){

   $('.extras').click(function(){

    $('.profile-list').toggleClass('showing')

  });

   $('.more-menu-bottom').click(function(){

    $('.extra-menu-mobile').toggleClass('showall-extramenus')

  })

 })
  
</script>

</body>
</html>