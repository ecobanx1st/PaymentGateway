@php $title = "Pos Tutorial"; $atitle ="merchant";
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
                  <h1>POS How-to/Tutorial</h1>
                  <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                </div>

              </div>

              <article class="gridparentbox">
  <div class="container sitecontainer walletpagebg">
    <div class="buttonmakerbg htmlpostbg posPost">
      <h5>Tutorial: Point of Sale Interface</h5><hr>
      <p>
        The POS interface is designed to be a simple way to accept in-person payments. Here is the preferred way to use the interface:<br> Start by bookmarking your POS checkout URL on your phone/tablet. [If you log in to your account and return to this page we will have your checkout URL here for you.] </p>
        <p>When a customer wants to pay, simply:</p>
        <ul>
        <li>Open your saved checkout page and enter the customer's total then click Next.</li>
        <li>If you are accepting more than Bitcoin ask the customer which coin they would like to pay with and select it for them, then click Next.</li>
        <li>The status page will have a QR code on it, display this to the buyer so they can scan it with their phone to pay the balance.</li>
        <li>Watch the status page until it indicates they have sent funds, depending on the amount of the order you may want to wait for the payment to be Complete in case of any issues. (WARNING: If you do choose to accept payment without confirms make sure the amount they sent matches the total expected!!!)</li>
        </ul>
      <p></p>
    </div>
  </div>
</article>
          
        </div>

     </div>
  </div>
</section>



<script>
	$("button").click(function() {
  $(".popup").fadeIn(500);
});
$(".close").click(function() {
  $(".popup").fadeOut(500);
});

</script>

<script>
function myFunction() {
  var copyText = document.getElementById("myInput");
  copyText.select();
  document.execCommand("copy");
  
  var tooltip = document.getElementById("myTooltip");
  tooltip.innerHTML = "Copied";
}
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

</body>
</html>
