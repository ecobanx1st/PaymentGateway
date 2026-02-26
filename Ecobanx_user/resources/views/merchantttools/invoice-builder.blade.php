@php $title = "Invoice Builder"; $atitle ="merchant";
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
                <div class="head-title-part">
                  <h1>Invoice Builder</h1>
                </div>

              </div>

			  <article class="gridparentbox">
  <div class="container sitecontainer">
    <div class="buttonmakerbg htmlpostbg">
      <div class="table-responsive" data-simplebar="">
<div class="form-container buttonmaker">


        <form method="post" id="profileForm" autocomplete="off">
          {{ csrf_field() }}
                    <table class="table table-small-font no-mb table-borderded">
            <thead>
              <tr>
                <th>Item</th>
                <th>Value</th>
                <th>Required?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Merchant ID <span class="text-danger">*</span></td>
                <td>
                  <input type="hidden" id="data_url" value="{{ route('makeInvoiceBuilder') }}">
                  
                  <input  name="merchant" value="{{$merchant}}" class="form-control" readonly>
                  <td class="text-center">Yes</td>
                </td>
              </tr>
              <input type="hidden" id="pricecalculate_url" value="{{ route('calLiveprice') }}">
              <input type="hidden" id="liveprice" value="">
              <tr>
                <td>Amount in Currency <span class="text-danger">*</span></td>
                <td class="slectinputbox ">
                  <input name="currency_amount" value="0" class="form-control allownumericwithdecimal" id="item_value" value="">
                  <span class="selectrightbox">
                    <select class="form-control" name="convert_currency" id="convert_currency">
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </span>
                                  </td>
                <td style="text-align:center">Yes</td>
              </tr>
              <span id="errorSellMsg"></span>
              <tr>
                <td>Request Amount <span class="text-danger">*</span></td>
                <td class="slectinputbox ">
                  <input name="item_amount" value="0" class="form-control allownumericwithdecimal" id="item_amount" value="">
                  <span class="selectrightbox">
                    <select class="form-control" name="paymentcurrency" id="paymentcurrency">
                      @forelse($comDetails as $key => $val)
                      <option value="{{$val->source}}">{{$val->source}}</option>
                      @empty
                      @endforelse
                    </select>
                  </span>
                                  </td>
                <td style="text-align:center">Yes</td>
              </tr>
              <tr>
                <td>Request Description <span class="text-danger">*</span></td>
                <td class="">
                  <input name="item_description" class="form-control allletterwithnumberspace" value="">
                                  </td>
                <td class="text-center">Yes</td>
              </tr>
              <tr>
                <td>Invoice <span class="text-danger">*</span></td>
                <td class="">
                  <input name="invoice" class="form-control allownumericwithoutdecimal" value="">
                                  </td>
                <td class="text-center">Yes</td>
              </tr>
              <tr>
                <td>Tax Amount</td>
                <td class="">
                  <input name="tax_amount" value="0.00000000" class="form-control allownumericwithdecimal" id="tax_amount" value="">
                                  </td>
                <td class="text-center">No</td>
              </tr>
              <tr>
                <td>Collect Shipping Address</td>
                <td class="">
                  <label class="checkcont">
                    <input name="shipping_address" id="shipping_address" type="checkbox" value="off"> <span class="checkmark"></span></label>
                                      </td>
                  <td class="text-center">No</td>
                </tr>
                <tr>
                  <td>Shipping Cost</td>
                                                      <td class="">
                    <input name="shipping_cost" id="shipping_cost" class="form-control allownumericwithdecimal" value="0.00000000">
                                      </td>
                  <td class="text-center">No</td>
                </tr>
                <tr>
                  <td>IPN URL</td>
                  <td class="">
                    <input name="ipn_url" class="form-control" onkeyup="isValidURL(this.value, 'ipn_url')" value="">
                    <h5 class="frm-subtext">Leave blank to use your account default.</h5>
                    <span id="ipn_url" class="text-danger"></span>
                                      </td>
                  <td class="text-center">No</td>
                </tr>
                <tr>
                  <td>Allow buyer to Leave a Note</td>
                  <td class="">
                    <label class="checkcont">
                      <input name="leave_msg" id="leave_msg" type="checkbox" value="off"> <span class="checkmark"></span></label>
                                          </td>
                    <td class="text-center">No</td>
                  </tr>
                  <tr>
                    <td colspan="3" align="center">
                      <div id="showError" class="text-danger"></div>
                      <button type="button" id="generate_btn" class="btn sitebtn mb-20 mt-20">Generate Link</button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">For a full list of fields and detailed information please check out the <a href="{{ route('merchanttoolssimple') }}" class="alink">HTML POST Fields</a> page.</td>
                  </tr>
                </tfoot>
              </table>
            </form>
			</div>
          </div>
        </div>
      </div>
    </article>

          
        </div>

     </div>
  </div>
</section>


<div class="modal fade modalbgt" id="verificationModal">
      <div class="modal-dialog">
        <!-- Modal content-->
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Link for Copy / Paste</h4>
            <button type="button" class="close" data-bs-dismiss="modal"><span>&times;</span></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <div class="input-group-append copybtnbg" onclick="myCopyFunc1('1')" style="cursor: pointer;">
                  <span class="input-group-text btn sitebtn btn-sm" id="myTooltip1"><strong class="t-white"><i class="fa fa-clipboard"></i> Copy Link</strong></span>
                </div>
              </div>
            </div><br />
            <div class="alert alert-info">
              <i class="fa fa-info-circle"></i> Copy the below link, after page refresh then you can't recover this link again!
            </div>
            <div class="buttonmakerbg">
              <div class="examplebtnbg">
                <div id="showHtmlForm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>

<script src="{{ url('js/validation.js') }}"></script>

<script>
  $(document).ready(function() {
    getLivePrice();
  });
  $('#convert_currency').on('change', function(){
    getLivePrice();
  });
  $('#paymentcurrency').on('change', function(){
    getLivePrice();
  });
  $('#item_value').on('keyup', function(){    
    var currencyAmt = $('#item_value').val();
    var livePrice = $('#liveprice').val();
    total = parseFloat(currencyAmt) / parseFloat(livePrice);
    if(total > 0){
      $('#item_amount').val(total); 
    }else{
      $('#item_amount').val(0);
    }
  });
  $('#item_amount').on('keyup', function(){
    var currencyAmt = $('#item_amount').val();
    var livePrice = $('#liveprice').val();
    total = parseFloat(currencyAmt) * parseFloat(livePrice);
    if(total > 0){
      $('#item_value').val(total); 
    }else{
      $('#item_value').val(0);
    }
  });
  function getLivePrice(){
    var formData = $('#profileForm').serialize();
    var data_url = $('#pricecalculate_url').val();
    $.ajax({
      type: "post",
      url: data_url,
      data: formData,
      dataType: "json",
      success: function(data){
        if(data.status)
        {
          var result = data.result;
          //$('#item_amount').val(result.amount);        
          $('#liveprice').val(result.price);        
        }
        else
        {
          $('#errorSellMsg').html(data.msg);
        }
      }
    });
  return false;
}

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
