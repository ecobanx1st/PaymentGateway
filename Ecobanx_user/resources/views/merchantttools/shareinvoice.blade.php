@php $title = "Invoice Builder"; $atitle ="merchant";
@endphp
@include('layouts.headercss')
</section>
</header>

<section class="Dashboard-page">
  <div class="container-fluid">
   <div class="row">

    @include('layouts.menu')
    <!--Before login header file -->
    <style>
      .btnbox .btn-success, .btnbox .btn-info {padding:7px 10px;background:#139e46;color:#fff;font-size:14px;border:1px solid #139e46;border-radius:4px;cursor: pointer;} .btnbox .btn-success:hover, .btnbox .btn-success:focus, .btnbox .btn-success:active {background:#139e46;color:#fff;border:1px solid #139e46;outline:none;} .btnbox .btn-info, .btn-info:hover, .btnbox .btn-info:focus, .btnbox .btn-info:active {background:#17492b;border:1px solid #17492b;outline:none;color:#fff;} .btnbox {text-align:right;padding: 18px 11px;}}@media (max-width:767px){.table-responsive{border:0px;white-space: nowrap;}}
    </style>
    <div class="col-lg-9 col-md-10 col-sm-12 col-xs-12 center-content invoicebg">
      @if(session('success'))
      <div class="alert alert-success" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('success') }}
      </div>
      @endif
      @if(session('error'))
      <div class="alert alert-danger" role="alert">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Failed!</strong> {{ session('error') }}
      </div>
      @endif
      <h3 class="text-center fnt-bld inner-heading text-uppercase">Invoice</h3>
      <hr class="x-linef">
      <div style="color: #666;background:#fff;padding:20px 20px;margin-top:25px;">
        <!--print and download-->
        <div id="print" class="invoicetableb">
          @if($category->invoicetype == 'simple')
          <div style="font-family:Roboto,Helvetica,Arial,sans-serif;border:1px solid #ccc;">
            <div class="table-responsive">
              <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #e8eaec;padding:5px 9px;">
                <tbody>
                  <tr>
                    <td style="padding:25px 10px;border-bottom:1px dashed #ccc;vertical-align:top;">
                      @if(!empty($category->logo))
                      <img src="{{url('public/storage/invoice/'.$category->logo)}}" style="width:100px !important;">
                      @else
                      <img src="{{ url('public/assets/images/darklogo.png') }}" style="width:100px !important;">
                      @endif
                    </td>
                    <td style="padding:25px 10px;color: #333;font-size:14px;font-weight:500;line-height: 22px;vertical-align:top;border-bottom:1px dashed #ccc;">
                      {!! str_replace("\r\n",'<br>', $category->companydetails) !!}
                    </td>
                    <td style="padding:25px 10px;color:#1548d8;text-align:right;font-size:20px;font-weight:700;border-bottom:1px dashed #ccc;text-transform:uppercase;vertical-align:top;">Invoice<br/><span style="font-size:14px;color: #333;font-weight:500;text-transform:capitalize;">Date : {{ date('F d Y H:i:s', strtotime($category->created_at)) }},<br/>Invoice No : {{ $category->invoice_id }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="table-responsive">
              <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding:0px 9px;">
                <tbody>
                  <tr>
                    <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Name : <br><span style="font-weight: 400;">{{ $category->customername }}</span></td>
                    <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Email : <br><span style="font-weight: 400;text-transform:lowercase;">{{ $category->customeremail }}</span></td>
                  </tr>
                  <tr>
                    <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Bill To :</td>
                    <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Shipping To :</td>
                  </tr>
                  <tr>
                    <td style="padding:10px;color: #333;font-size:14px;font-weight:500;line-height: 22px;">
                      {!! str_replace("\r\n",'<br>', $category->billaddress) !!}</td>
                      <td style="padding:10px;color: #333;font-size:14px;font-weight:500;line-height: 22px;">
                        {!! str_replace("\r\n",'<br>', $category->shippingaddress) !!}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="table-responsive">
                  <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding: 10px 9px;">
                    <tbody>
                      <tr>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight:600;line-height: 22px;background: #1548d8;">Item No</td>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight:600;line-height: 22px;background: #1548d8;">Description</td>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight: 600;line-height: 22px;background: #1548d8;">Quantity</td>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight: 600;line-height: 22px;background: #1548d8;">Unit Price</td>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight: 600;line-height: 22px;background: #1548d8;">Shipping</td>
                      </tr>
                      @forelse($subcategory as $key => $value)
                      <tr>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->itemno}}</td>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->itemname}}</td>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->quantity}}</td>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->priceperitem}} {{$category->coin}}</td>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->shipping}} {{$category->coin}}</td>
                      </tr>
                      @empty
                      @endforelse
                      <tr>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">Remarks / Payment Instruction</td>
                        <td></td>
                        <td></td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;">Subtotal</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">{{ $category->subtotal }} {{$category->coin}}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;">VAT Rate ({{$category->tax}}%)</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">{{ $category->taxamt }} {{$category->coin}}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;">Total</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:0px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">{{ $category->total }} {{$category->coin}}</td>
                      </tr>
                      <tr>
                        <td style="border-top:1px dashed #ccc;"></td>
                        <td style="border-top:1px dashed #ccc;"></td>
                        <td style="border-top:1px dashed #ccc;"></td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;border-top:1px dashed #ccc;">Amount in Input Coin</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-top:1px dashed #ccc;">{{ $category->checkamount }} {{$category->coin}}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;">Amount in Payment Coin</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">{{ $category->payment_checkamt }} {{$category->cointwo}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              @else

              <div style="font-family:Roboto,Helvetica,Arial,sans-serif;border:1px solid #ccc;">
                <div class="table-responsive">
                  <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #e8eaec;padding:5px 9px;">
                    <tbody>
                      <tr>
                        <td style="padding:25px 10px;color: #333;font-size:14px;font-weight:500;line-height: 22px;vertical-align:top;border-bottom:1px dashed #ccc;">
                          {!! str_replace("\r\n",'<br>', $category->companydetails) !!}
                        </td>
                        <td style="padding:25px 10px;color:#1548d8;text-align:right;font-size:20px;font-weight:700;border-bottom:1px dashed #ccc;text-transform:uppercase;vertical-align:top;">Invoice<br/><span style="font-size:14px;color: #333;font-weight:500;text-transform:capitalize;">Date : {{ date('F d Y H:i:s', strtotime($category->created_at)) }}</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="table-responsive">
                  <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding:0px 9px;">
                    <tbody>
                      <tr>
                        <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Name : &nbsp;<span style="font-weight: 400;">{{ $category->customername }}</span></td>
                        <td style="padding:10px;color: #333;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="table-responsive">
                  <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding: 10px 9px;">
                    <tbody>
                      <tr>
                        <td colspan="4" style="padding:5px 10px;color: #fff;font-size:14px;font-weight:600;line-height: 22px;background: #1548d8;">Goods</td>
                        <td style="padding:5px 10px;color: #fff;font-size:14px;font-weight: 600;line-height: 22px;background: #1548d8;">Price</td>
                      </tr>
                      @forelse($subcategory as $key => $value)
                      <tr>
                        <td colspan="4" style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{!! str_replace("\r\n",'<br>', $value->itemname) !!}</td>
                        <td style="padding:10px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;border-bottom:1px dashed #ccc;">{{$value->priceperitem}} {{$category->coin}}</td>
                      </tr>
                      @empty
                      @endforelse

                      <tr>
                        <td colspan="4" style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 600;line-height: 22px;text-align: right;">Amount in Payment Coin</td>
                        <td style="padding-left:10px;padding-right:10px;padding-top:10px;padding-bottom:15px;color: #333;font-size:14px;font-weight: 500;line-height: 22px;">{{ $category->payment_checkamt }} {{$category->cointwo}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              @endif
            </div>
            <!--print and download-->

            <div class="btnbox">
              <button type="button" class="btn-success" onclick="printDiv();">Print & Preview</button>
              <button type="button" class="btn-info" onclick="convertPdf();">Download</button>
            </div>     

            <center>
              @if(!empty($category->referralid))
              <div class="input-group">
                <input type="text" class="form-control" aria-describedby="basic-addon2" value="{{ url('/invoice-payment/'.\Crypt::encrypt($category->referralid)) }}" id="coinaddress" readonly="">
                <span onclick="myCopyFunc()" class="input-group-addon copy-btn ctexty" id="basic-addon1">Copy</span>
              </div>
              @else
              <button type="button" class="btn btn-success" onclick="generateLink();">Generate Link</button>
              @endif
            </center>

          </div>
        </div>
        <div class="center-btn text-center">
          <br>
          @if($category->invoicetype == 'simple')
          <a href="{{ url('/view-invoice') }}" class="btn btn-warning"><i class="fa fa-arrow-left"></i> Back to Invoice</a><br />
          @else
          <a href="{{ url('/view-request-invoice') }}" class="btn btn-warning"><i class="fa fa-arrow-left"></i> Back to Invoice</a><br />
          @endif
        </div>
      </body>
      </html>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.3/jspdf.debug.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.js"></script>
      <script type="text/javascript">
        function convertPdf(){
          html2canvas($("#print"), { 
            onrendered: function(canvas) {
              var imgData = canvas.toDataURL('image/png'); 
              var doc = new jsPDF({  
                unit: 'px',  
                format: 'a4'  
              });  
              doc.addImage(imgData, 'PDF', 3, 4);
doc.save('{{ $category->id }}.pdf'); //SAVE PDF FILE
}
});
        }

        function printDiv() { 
          var divContents = document.getElementById("print").innerHTML; 
          var a = window.open('', '', 'height=800, width=800'); 
          a.document.write('<html>'); 
          a.document.write('<body>'); 
          a.document.write(divContents); 
          a.document.write('</body></html>'); 
          a.document.close(); 
          a.print(); 
        } 

        function generateLink(){
          if (confirm('If you generate the link, you can\'t edit or delete the Invoice. Please Confirm?')) {
           $.ajax({
            url: '{{ url("generateLink") }}',
            type: 'POST',
            dataType : "json",
            data: {
              "_token": "{{ csrf_token() }}",
              "id": "{{ $category->id }}"
            }, 
            success: function (request) {
              if(request.msg == 'success') {
                  //$('#sug_msg').show(); 
                window.setTimeout(function(){location.reload()},2000);
              }
            }
          });
         }
       }
       function myCopyFunc() {
        var copyText = document.getElementById("coinaddress");
        copyText.select();
        document.execCommand("Copy");
        var tooltip = document.getElementById("basic-addon1");
        tooltip.innerHTML = "<strong class='text-danger'>Copied!</strong>";
      }
    </script> 
