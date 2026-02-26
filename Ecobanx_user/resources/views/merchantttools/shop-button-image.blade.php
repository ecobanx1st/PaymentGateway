   @php $title = "Shop Button Image"; $atitle ="merchant";
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
                  <h1>Donation Button Example</h1>
                </div>

              </div>

              <article class="gridparentbox buttonmakerbg ">
  <div class="container sitecontainer">
    <div class="buttonmakerbg htmlpostbg">
      <div class="examplecodebg">
                Image Code: &lt;input type="image" src="https://pg.ecobanx.com/img/add-to-cart.svg" alt="Add to Cart..."&gt;
        <div class="buttonlogo shop ">
            <image src="https://pg.ecobanx.com/img/add-to-cart.svg" width="300"/>

        </div>
    </div>
  </div>
</div></article>

        </div>

     </div>
  </div>
</section>


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
