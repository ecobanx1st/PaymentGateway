<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- CSRF Token -->
  <meta name="csrf-token" content="{{ csrf_token() }}">

  <title>{{ config('app.name', 'Laravel') }}</title>
  <link rel="icon" type="image/png" sizes="32x32" href="{{ url('public/assets/images/favicon.png') }}">
  <!-- Styles -->    
  <link href="https://fonts.googleapis.com/css?family=Muli:200,300,400,700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="{{ asset('public/css/bootstrap.min1.css') }}" type="text/css" />
  <link href="{{ asset('public/font-awesome/css/font-awesome.min.css') }}" rel="stylesheet" type="text/css" />
  <link href="{{ asset('public/css/muiform.css') }}" rel="stylesheet" type="text/css" />
  <link rel="stylesheet" href="{{ asset('public/css/home.css') }}" type="text/css" />
  <link href="{{ asset('public/compiled/flipclock.css') }}" rel="stylesheet">

</head>
<body>
  <div id="app"></section>
    <div class="inner-header">
      <header class="banner-bg">
      </div>
    </header>

    <!--Before login header file -->
    <style>
      .btnbox .btn-success, .btnbox .btn-info {padding:7px 10px;background:#139e46;color:#fff;font-size:14px;border:1px solid #139e46;border-radius:4px;cursor: pointer;} .btnbox .btn-success:hover, .btnbox .btn-success:focus, .btnbox .btn-success:active {background:#139e46;color:#fff;border:1px solid #139e46;outline:none;} .btnbox .btn-info, .btn-info:hover, .btnbox .btn-info:focus, .btnbox .btn-info:active {background:#17492b;border:1px solid #17492b;outline:none;color:#fff;} .btnbox {text-align:right;padding: 18px 11px;}.invoicebg{margin-top:40px;}@media (max-width:767px){.table-responsive{border:0px;white-space: nowrap;}}
    </style>

    <article class="inner-banner">
      <section class="loginbg inner-banner-ht buttonmaker">
        <div class="container">
          <div class="col-lg-9 col-md-10 col-sm-12 col-xs-12 center-content invoicebg">
            <h3 class="text-center fnt-bld inner-heading text-uppercase">Invoice</h3>
            <hr class="x-linef">
            <div style="color: #666;background:#fff;padding:20px 20px;margin-top:25px;">
              <!--print and download-->
              <div id="print" class="invoicetableb">

                <form method="POST" action="{{ route('makeinvoiceorder') }}">
                  {{ csrf_field() }}

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
                      <td style="padding:25px 10px;color:#027119;text-align:right;font-size:20px;font-weight:700;border-bottom:1px dashed #ccc;text-transform:uppercase;vertical-align:top;">Invoice<br/><span style="font-size:14px;color: #333;font-weight:500;text-transform:capitalize;">Date : {{ date('F d Y H:i:s', strtotime($category->created_at)) }},<br/>Invoice No : {{ $category->invoice_id }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="table-responsive">
                <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding:0px 9px;">
                  <tbody>
                    <tr>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Name : <br><span style="font-weight: 400;">{{ $category->customername }}</span></td>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Email : <br><span style="font-weight: 400;text-transform:lowercase;">{{ $category->customeremail }}</span></td>
                    </tr>
                    <tr>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Bill To :</td>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Shipping To :</td>
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
                      <td style="padding:25px 10px;color:#027119;text-align:right;font-size:20px;font-weight:700;border-bottom:1px dashed #ccc;text-transform:uppercase;vertical-align:top;">Invoice<br/><span style="font-size:14px;color: #333;font-weight:500;text-transform:capitalize;">Date : {{ date('F d Y H:i:s', strtotime($category->created_at)) }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="table-responsive">
                <table align="center" width="100%" border="0" cellspacing="0" cellpadding="10" style="background-color: #fff;padding:0px 9px;">
                  <tbody>
                    <tr>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;">Customer Name : &nbsp;<span style="font-weight: 400;">{{ $category->customername }}</span></td>
                      <td style="padding:10px;color: #0d5f1e;font-size:15px;font-weight: 600;text-transform:uppercase;border-bottom:1px dashed #ccc;"></td>
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

                      <div class="btnbox">
                        <button class="btn-info">Check Out</button>
                      </div>

                    </form>
                  </div>
                  <!--print and download-->

                </div>
              </div>
            </div>

          </section>
        </article>

        <!--Before login footer file -->

        <footer>
          <section class="footer-gray-bg">
            <div class="container">             
              <div class="footer-contnet">
                <div class="col-md-12 col-sm-12 col-xs-12 ftext">
                  <p class="t-white text-center">Copyright © @php echo date('Y'); @endphp. All Rights Reserved</p>
                </div>

              </div>
            </div>

          </section>
        </footer>
       

      </body>
      </html>
