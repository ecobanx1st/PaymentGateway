@php $title = "Merchant Tool"; $atitle ="merchant";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')


    <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

     <div class="header-part-outer">

      <div class="head-title-part">
        <h1>Merchant Tools</h1>
        <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
      </div>

    </div>


    <div class="dashboard-body merchant-body">

     <div class="row">



       <div class="col-lg-2 col-xl-2 col-md-6 col-sm-12 col-xs-12 toolsboxinner">

         <div class="merchant-inner">

           <div class="merchant-inner-top">
             <div class="merchant"><img src="{{ url('img/merchant-1.svg') }}"></div>
             <h4>Payment Buttons</h4>
             <p>Our variety of payment buttons can be
              implemented quickly and seamlessly to
              provide crypto payment functionality on
            your site.</p>
            <hr>
          </div>
          <!-- <div class="merchant-inner-bottom"><a href="#">Find out more</a></div> -->
          <div id="demo" class="in collapse show">
            <ul class="toollist">

              <li><a href="{{ route('buttonmaker') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Simple Button Maker</a></li>
              <li><a href="{{ route('merchanttoolssimple') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Simple HTML POST Fields</a></li>
              <li><a href="{{ route('examplebuttons') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Simple Button Examples</a></li>
              <li><a href="{{ route('advancebuttonmaker') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Advance Button Maker</a></li>
              <li><a href="{{ route('advancemerchanttoolssimple') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Advance HTML POST Fields</a></li>
              <li><a href="{{ route('advanceexamplebuttons') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Advance Button Examples</a></li>
            </ul>
          </div>
        </div>






      </div>

      <div class="col-lg-2 col-xl-2 col-md-6 col-sm-12 col-xs-12 toolsboxinner">

       <div class="merchant-inner">

         <div class="merchant-inner-top">
           <div class="merchant"><img src="{{ url('img/merchant-2.svg') }}"></div>
           <h4>Payment Buttons 2</h4>
           <p>Our variety of payment buttons can be
            implemented quickly and seamlessly to
            provide crypto payment functionality on
          your site.</p>
          <hr>
        </div>

        <!-- <div class="merchant-inner-bottom"><a href="#">Find out more</a></div> -->

        <div id="demo" class="in collapse show">
          <ul class="toollist">
            <li><a href="{{ route('shopcardfield') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Cart HTML POST Fields</a></li>
            <li><a href="{{ route('shopbuttonexamples') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Cart Button Examples</a></li>
            <li><a href="{{ route('shopbuttonImage') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Cart Button Images</a></li>
            <li><a href="{{ route('donationButton') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Donation Button Maker</a></li>
            <li><a href="{{ route('donationField') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Donation HTML POST Fields</a></li>
            <li><a href="{{ route('donationbuttonExample') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Donation Button Examples</a></li>
          </ul>
        </div>

      </div>

    </div>

    <div class="col-lg-2 col-xl-2 col-md-6 col-sm-12 col-xs-12 toolsboxinner">

     <div class="merchant-inner">

       <div class="merchant-inner-top">
         <div class="merchant"><img src="{{ url('img/merchant-3.svg') }}"></div>
         <h4>APIs</h4>
         <p>Integrate payment or wallet APIs into
          your business for a custom crypto
        experience for your clients.</p>
        <hr>
      </div>

      <!-- <div class="merchant-inner-bottom"><a href="#">Find out more</a></div> -->

      <div id="demo" class="in collapse show">
        <ul class="toollist">
          <li><a href="{{ url('merchant-tools-ipn') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Instant Payment Notification</a></li>
          <li><a href="{{ url('Hashcodexment-api') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>API Document</a></li>
        </ul>
      </div>

    </div>

  </div>

  <div class="col-lg-2 col-xl-2 col-md-6 col-sm-12 col-xs-12 toolsboxinner">

   <div class="merchant-inner">

     <div class="merchant-inner-top">
       <div class="merchant"><img src="{{ url('img/merchant-4.svg') }}"></div>
       <h4>Invoice Builder</h4>
       <p>Send your customers a link to complete a payment in crypto.</p>
       <hr>
     </div>

     <!-- <div class="merchant-inner-bottom"><a href="#">Find out more</a></div> -->

     <div id="demo" class="in collapse show">
      <ul class="toollist">
        <li><a href="{{ route('invoiceBuilder') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>Payment Request Invoice Maker</a></li>
      </ul>
    </div>

  </div>

</div>

<div class="col-lg-2 col-xl-2 col-md-6 col-sm-12 col-xs-12 toolsboxinner">

 <div class="merchant-inner">

   <div class="merchant-inner-top">
     <div class="merchant"><img src="{{ url('img/merchant-5.svg') }}"></div>
     <h4>Point of Sale Tools</h4>
     <p>Accept crypto payments in person using a our simple PoS interface.</p>
     <hr>
   </div>
   <div id="demo" class="in collapse show">
    <ul class="toollist">
      <li><a href="{{ route('posTutorial') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>POS How-to/Tutorial</a></li>
      <li><a href="{{ route('posHtmlFields') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>HTML URL/POST Fields</a></li>
      <li><a href="{{ route('posbutton') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>POS Link & QR Code Generator</a></li>
      <li><a href="{{ route('posExample') }}"><i class="fa fa-long-arrow-right" aria-hidden="true"></i>POS Example</a></li>
    </ul>
  </div>
</div>

</div>


</div>




</div>

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
