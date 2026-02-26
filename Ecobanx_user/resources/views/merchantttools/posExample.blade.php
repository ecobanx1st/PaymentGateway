@php $title = "Merchant Tool Simple"; $atitle ="merchant"; @endphp
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
                        <div class="logo-payment">
                            <a href="dashboard.html"><img src="img/logo.png" alt="logo"></a>
                        </div>
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
                <h1>POS Button Example</h1>
                <!-- <p>We are on a mission to help developers like you to build beautiful
                projects for free.</p> -->
            </div>

        </div>

        <article class="inner-banner">
            <section class="loginbg inner-banner-ht buttonmaker">
                <div class="panelcontentbox contentbox centerbox mx-auto">
                    <form
                        class="siteformbg"
                        method="get"
                        id="profileForm"
                        action="{{ route('posdeposit') }}"
                        autocomplete="off">
                        
                        <input type="hidden" name="cmd" value="_pos" class="form-control" readonly=""/>
                        <input type="hidden" name="merchant" value="{{ $merchant }}" class="form-control" @if($merchant !="") readonly="" @endif />
                        <input type="hidden" name="want_shipping" value="0" class="form-control" @if($merchant !="") readonly="" @endif />
                        <input type="hidden" name="item_name" value="Order Payment" class="form-control" @if($merchant !="") readonly="" @endif />
                        <input type="hidden" name="currency" value="BTC" class="form-control" id="selected_asset_id" />
                        <div class="table-responsive" data-simplebar="init">
                            <div class="simplebar-track vertical" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"></div>
                            </div>
                            <div class="simplebar-track horizontal" style="visibility: hidden;">
                                <div class="simplebar-scrollbar"></div>
                            </div>
                            <div
                                class="simplebar-scroll-content"
                                style="padding-right: 17px; margin-bottom: -34px;">
                                <div
                                    class="simplebar-content"
                                    style="padding-bottom: 17px; margin-right: -17px;"></div>
                            </div>
                        </div>
                        <table class="table table-small-font padtable">
                            <input type="hidden" name="step" value="1">
                            <tbody class="phone">
                                <tr>
                                    <td>Amount
                                        <span class="text-danger">*</span></td>
                                    <td class="slectinputbox ">
                                        <input name="amount" value="" class="form-control allownumericwithdecimal" id="amountf">
                                        <span class="selectrightbox">
                                            <select class="form-control" name="asset" onchange="getName(this)">
                                                @forelse($comDetails as $key => $val)
                                                <option value="{{$val->id}}" data-asset="{{$val->source}}">{{$val->source}} @if($val->assertype != 'coin') ({{$val->assertype}}) @endif</option>
                                                @empty
                                                @endforelse
                                            </select>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <table
                            align="center"
                            border="0"
                            cellspacing="0"
                            cellpadding="0"
                            class="table checktable padtable">
                            <tbody class="phone">
                                <tr>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(1); return false;"
                                            fdprocessedid="fjdqrh">1</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(2); return false;"
                                            fdprocessedid="uh6adb">2</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(3); return false;"
                                            fdprocessedid="ap07fm">3</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(4); return false;"
                                            fdprocessedid="2vk8g">4</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(5); return false;"
                                            fdprocessedid="1oz4o">5</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(6); return false;"
                                            fdprocessedid="rgc0p5">6</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(7); return false;"
                                            fdprocessedid="k6idui">7</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(8); return false;"
                                            fdprocessedid="xtlgml">8</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(9); return false;"
                                            fdprocessedid="n26oqb">9</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(0); padPress(0); return false;"
                                            fdprocessedid="u9c57j">00</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPress(0); return false;"
                                            fdprocessedid="p7hvhu">0</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padPeriod(); return false;"
                                            fdprocessedid="s9xi2p">.</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="2">
                                        <button
                                            class="btn btn-primary btnpad2 calbtn"
                                            onclick="padClear(); return false;"
                                            fdprocessedid="oq7psf">CLEAR</button>
                                    </td>
                                    <td>
                                        <button
                                            class="btn btn-danger btnpad2 calbtn"
                                            onclick="padBack(); return false;"
                                            fdprocessedid="5exkkm">
                                            <i class="fa fa-arrow-left"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <br>
                        <div class="container text-center cont">
                            <!-- <div class="alert alert-danger alert-dismissible fade show" role="alert">
                                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" fdprocessedid="1eknhv"></button>The amount field is required.
                            </div> -->
                            <button class="btn btn-sm green-btn" type="submit" id="save_btn" fdprocessedid="wv3a4j">Continue <i class="fa fa-arrow-right"></i></button>
                        </div>
                    </form>
                </div>
                <div class="text-center">
          				<a href="{{ route('merchanttools') }}" class="text-center btn sitebtn"><i class="fa fa-arrow-left"></i> Back to Merchant Tool</a>
        			</div>
            </section>
        </article>

    </div>

</div>
</div>
</section>

<script
src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation.js') }}"></script>
<script type="text/javascript">
function getName(select) {
  // You can get the value like you did 
  var value = select.value;

  // And here we get the name
  var selectedOption = select.options[select.selectedIndex];
  var name = selectedOption.getAttribute('data-asset');
  $('#selected_asset_id').val(name);
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