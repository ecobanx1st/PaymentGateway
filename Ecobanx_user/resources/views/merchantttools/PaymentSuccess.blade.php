@php $title = "Merchant Tool Simple"; $atitle ="merchant"; @endphp
@include('layouts.headercss')
</section>
</header>

<section class="Dashboard-page">
<div class="container-fluid">
<div class="row">


    <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">

    <div class="center-content">
        <div class="stepsbanner">
        <div class="logo text-center">
          <a href="{{ url('/') }}">
            <img src="{{ url('img/logo.png') }}" alt="logo">
          </a>
        </div>
          <h4 class="headt text-center">Payment Success</h4>
          <div class="row">
            <div class="col-md-12">
              <div class="form-group test-icon text-center">
                <i class="fa-solid fa-circle-check"></i>
                <p>Your payment has been Successfull</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

</div>
</div>
</section>

<script
src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation.js') }}"></script>



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