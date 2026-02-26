@php $title = "Button Maker"; $atitle ="merchant";
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
                                <div class="logo-payment"><a href="dashboard.html"><img src="img/logo.png"
                                            alt="logo"></a></div>
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
                        <h1>Eco Banx API</h1>
                        <!-- <p>We are on a mission to help developers like you to build beautiful projects for free.</p> -->
                    </div>

                </div>

                <article class="inner-banner">
                    <section class="loginbg inner-banner-ht buttonmaker">
                        <div class="container apicointainer">
                            <div class="col-md-12 col-sm-12 col-xs-12 center-content securitybox">
                                <!-- <h3 class="text-center fnt-bld inner-heading">Eco Banx  API</h3> -->
                                <hr class="x-linef">
                                <br />

                                <div class="form-container">
                                    <div class="examplecodebg apieditortext">
                                        <div class="row">
                                            <div class="col-md-3 col-sm-4 col-xs-12 apiciontenttext">

                                                @foreach($category as $val)
                                                <h4 class="subt-t fnt-reg">{{ $val->category }}</h4>
                                                @php
                                                $subcategory
                                                =App\Models\Subapicategory::where('cat_id',$val->id)->get();
                                                @endphp

                                                <ul class="listsetup">
                                                    @foreach($subcategory as $val1)
                                                    <li @if($Subapicategory->id == $val1->id) class="active" @endif><a
                                                            href="{{ url('view/'.\Crypt::encrypt($val->id).'/'.\Crypt::encrypt($val1->id)) }}"
                                                            class="tab">{{ $val1->sub_title }}</a></li>
                                                    @endforeach
                                                </ul>

                                                @endforeach




                                            </div>
                                            <div class="col-md-9 col-sm-8 col-xs-12 apicontentf">
                                                <h4 class="subt-t fnt-reg">{{ $Subapicategory->sub_title }}</h4>
                                                <p class="content">{!! $Subapicategory->desc !!}</p>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
            </div>
</section>
</article>

</div>

</div>
</div>
</section>

<script src="https://code.jquery.com/jquery-3.7.0.min.js"
    integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g=" crossorigin="anonymous"></script>

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
$(document).ready(function() {
    $('.tab').on('click', function() {
        $('.tab').removeClass('active');
        $(this).addClass('active');
    })
});
</script>

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

</body>

</html>