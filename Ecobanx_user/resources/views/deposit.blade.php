<!DOCTYPE html>
<html lang="en">
<head>
  <title>Deposit | Payment Gateway</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/js/bootstrap.bundle.min.js"></script>
  <link rel="stylesheet" type="text/css" href="css/style.css">
  <link rel="stylesheet" type="text/css" href="css/custom.css">
  <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" type="text/css" href="css/owl.carousel.min.css">
  <link rel="stylesheet" type="text/css" href="css/owl.theme.default.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
  <script src="js/jquery.min.js"></script>
<script src="js/owl.carousel.min.js"></script>

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="./img/favicon_io/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="./img/favicon_io/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="./img/favicon_io/favicon-16x16.png">
    <link rel="manifest" href="/site.webmanifest">
    
    
</head>
<body>


  
<section class="Dashboard-page wallet-page-main">
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
                  <h1>Deposit</h1>
                  <p>We are on a mission to help developers like you to build beautiful projects for free.</p>
                </div>

              </div>


              <div class="dashboard-body wallet-body">
                   
                   <div class="row">

                    <div class="col-lg-8 col-xl-8 col-md-12 col-sm-12 col-xs-12">
                        <div class="deposit-card">
                            <h3>BTCDeposit</h3>
                            <div class="copy-text">
                                <input type="text" class="text" value="12HVhZdQckzcKaxexJYKgdwj7e6kAz6qgo" />
                                <button>Copy</button>
                            </div>

                            <div class="row">
                                <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                                    <h5><span>Minimum Deposit Limit </span>: 0.00010000 BTC</h5>
                                    <h5><span>Deposit Fee </span> : 0.25000000 %</h5>
                                    <label>Note : Deposit may take from a few minutes to over 30 minutes.</label>
                                </div>

                                <div class="col-lg-6 col-xl-6 col-md-12 col-sm-12 col-xs-12">
                                    <div class="rq_code-card">
                                        <button>Download</button>
                                        <div class="qrcode">
                                            <img src="img/qrcode.png">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-4 col-xl-4 col-md-12 col-sm-12 col-xs-12">
                      <div class="wallet-history">
							<table class="table-style-history table table-responsive">
							<tr>
							<th>Coin</th>
							<th>Available Balance</th>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-1.png"></div><span>BTC</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-2.png"></div><span>ETH</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-3.png"></div><span>USDT</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-4.png"></div><span>USDC</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-5.png"></div><span>Tron</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-6.png"></div><span>Polygon</span></div></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-7.png"></div><span>Binance</span></div></td></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							<tr>
							<td><div class="mwc-inner"><div class="mwc"><img src="img/mwc-8.png"></div><span>Eurst</span></div></td></td>
							<td><span class="balance-span">0.00000000</span></td>
							</tr>
							</table>
                      </div>
                    </div>


                   </div>

              </div>
          
        </div>

     </div>
  </div>
</section>


<div class="mobile-menu-fixed">
  <ul class="menu-mobile">
  <li><a class="" href="dashboard.html"><div class="left-icons"><img src="img/left-side-icon-1.svg"></div>Dashboard</a></li>
  <li><a class="" href="merchant.html"><div class="left-icons"><img src="img/left-side-icon-2.svg"></div>Merchant</a></li>
  <li><a class="" href="history.html"><div class="left-icons"><img src="img/left-side-icon-3.svg"></div>History</a></li>
  <li><a class="" href="account-settings.html"><div class="left-icons"><img src="img/left-side-icon-4.svg"></div>Account</a></li>
  <li><a class="more-menu-bottom"><i class="fa-solid fa-ellipsis"></i>More</a></li>
  </ul>
  <ul class="extra-menu-mobile">
  <li><a class="" href="wallet.html"><div class="left-icons"><img src="img/left-side-icon-5.svg"></div>My Wallet</a></li>
  <li><a class="" href="#"><div class="left-icons"><img src="img/left-side-icon-6.svg"></div>Settings</a></li>
  <li><a class="" href="api-keys.html"><div class="left-icons"><img src="img/left-side-icon-7.svg"></div>API Keys</a></li>
  <li><a class="" href="ipn-history.html"><div class="left-icons"><img src="img/left-side-icon-8.svg"></div>IPN History</a></li>
  </ul>
  </div>


<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
  
var options = {
          series: [1.000, 0.555, 1.53800, 3.38],
          labels: ['BTC', 'ETH', 'USDT', 'USDC'],
          chart: {
          width: '100%',
          type: 'donut',
          height: 250,
        },
        dataLabels: {
          enabled: false
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              width: 300
            },
            legend: {
              show: false
            }
          }
        }],
        legend: {
          position: 'bottom',
          offsetY: 0,
          height: 230,
          show: false
        }
        };
        

        var chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
      

</script>

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

  <script>
    let copyText = document.querySelector(".copy-text");
copyText.querySelector("button").addEventListener("click", function () {
	let input = copyText.querySelector("input.text");
	input.select();
	document.execCommand("copy");
	copyText.classList.add("active");
	window.getSelection().removeAllRanges();
	setTimeout(function () {
		copyText.classList.remove("active");
	}, 2500);
});

  </script>

</body>
</html>
