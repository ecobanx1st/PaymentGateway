<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Admin Dashboard | {{ config('app.name') }} </title>

    <!-- favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="{{ url('favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ url('favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ url('/favicon/favicon-16x16.png') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- favicon !-->
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="theme-color" content="#ffffff">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css">

    <!-- Vendor styles -->
    <link rel="stylesheet" href="{{ url('adminpanel/dist/css/material-design-iconic-font.min.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/css/animate.min.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/js/jquery.scrollbar/jquery.scrollbar.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/css/fullcalendar.min.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/css/flatpickr.min.css') }}" />
    <link rel="stylesheet" href="{{ url('adminpanel/font-awesome/css/font-awesome.min.css') }}" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>

    <link rel="stylesheet" href="{{ url('adminpanel/css/app.min.css') }}">
    <link rel="stylesheet" href="{{ url('adminpanel/css/pagination.css') }}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.min.css"
        rel="stylesheet" />

    <script src="https://cdn.datatables.net/1.10.12/js/jquery.dataTables.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>



    @stack('customscripts')
</head>
<?php

  if(isset($atitle)){
    $active = $atitle;
  }else{
    $active = "";
  }
  ?>

<body data-sa-theme="7">

    <main class="main side-main">
        <div class="side-tog-main ">
            <button id="sidebarToggle" class="sidebar-toggle">
                <i class="fa fa-bars"></i>
            </button>
        </div>


        <aside class="sidebar">

            <div class="scrollbar-inner">
                <div class="user">
                    <div class="user__info" data-toggle="dropdown">
                        <div>
                            <div class="user__name">{{ $Admindetails->username }}</div>
                            <div class="user__email">{{ $Admindetails->email }} </div>
                        </div>
                    </div>
                </div>

                <ul class="navigation">
                    <li class="@@photogalleryactive active"><a @if($active=="dashboard" ) class="active" @endif
                            href="{{ url('admin/dashboard') }}"><i class="zmdi zmdi-view-dashboard"></i>Dashboard</a>
                    </li>
                    @if(in_array("read", explode(',',$AdminProfiledetails->userlist)))

                    <li class="@@photogalleryactive"><a @if($active=="user" ) class="active" @endif
                            href="{{ url('admin/users') }}"><i class="zmdi zmdi-accounts-alt"></i> Users</a></li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->kyc)))

                    <li class="@@photogalleryactive"><a @if($active=="kyc" ) class="active" @endif
                            href="{{ url('admin/kyc') }}"><i class="zmdi zmdi-assignment-o"></i>KYC Submit</a></li>
                    @endif
                    {{-- <li class="@@photogalleryactive"><a @if($active=="bloglist" ) class="active" @endif
                            href="{{ url('admin/blogs-list') }}"><i class="zmdi zmdi-assignment-o"></i>Blog List</a>
                    </li> --}}

                    @php
                    $cmss = \Request::segment(3);
                    $Commission = \App\Models\Commission::on('mysql2')->where('type','fiat')->get();
                    @endphp
                    @if(count($Commission) > 0)
                    <li class="navigation__sub navigation__sub--toggled"><a href="#"><i class="zmdi zmdi-code"
                                aria-hidden="true"></i>Admin Bank</a>
                        <ul>
                            @foreach ($Commission as $value)
                            <li class="@@colorsactive">
                                <a @if($value->source == $cmss) class="active" @endif
                                    href="{{ url('admin/bank/'.$value->source ) }}">{{ $value->source }}</a>
                            </li>
                            @endforeach
                        </ul>
                    </li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->deposithistory)))

                    {{-- <li class="navigation__sub navigation__sub--toggled deposittoggler"><a href="#"><i class="fa fa-money"
                                aria-hidden="true"></i>User Deposit History</a>
                        <ul class="listoddeposits">
                            @php $selectedcoin = \Request::segment(3); @endphp
                            @forelse(list_coin() as $coin)
                            <li class="@@colorsactive"><a @if(($selectedcoin==$coin->source) && $active=="deposit") class="active" @endif
                                    href="{{ url('admin/deposits/'.$coin->source) }}">{{$coin->source}}</a></li>
                            @empty
                            <li class="@@colorsactive"><a href="#">No Coins list</a></li>
                            @endforelse
                        </ul>
                    </li> --}}
                    <li class="navigation__sub navigation__sub--toggled togglerwithdraw"><a @if($active=="deposit" ) class="active" @endif href="{{ url('admin/deposits/USDT') }}"><i class="fa fa-arrows"
                                aria-hidden="true"></i>User Deposit History</a>
                    </li>
                    @endif


                    <li class="navigation__sub navigation__sub--toggled togglerwithdraw"><a @if($active=="withdraw" ) class="active" @endif href="{{ url('admin/withdraw/USDT') }}"><i class="fa fa-arrows"
                                aria-hidden="true"></i>User Withdraw History</a>
                    </li>

                    {{-- @endif --}}
                    @if(in_array("read", explode(',',$AdminProfiledetails->addadmin)))
                    <li class="@@photogalleryactive"><a @if($active=="" ) class="active" @endif
                            href="{{ url('/admin/subadminlist') }}"><i class="zmdi zmdi-assignment-o"></i>Sub-Admin
                            Control</a></li>
                    @endif
                    @if(in_array("write", explode(',',$AdminProfiledetails->adminwallet)))

                    <li class="@@photogalleryactive"><a @if($active=="feewallet" ) class="active" @endif
                            href="{{ url('admin/feewallet/ETH/coin') }}"><i class="zmdi zmdi-balance-wallet"></i> Admin
                            Wallet</a></li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->adminwallet)))
                    <!-- <li class="@@photogalleryactive"><a @if($active == "adminwallet") class="active" @endif  href="{{ url('admin/adminwallets') }}"><i class="zmdi zmdi-balance-wallet"></i>Admin Wallet Details</a></li>  -->
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->pay_his)))
                    <li class="@@photogalleryactive"><a @if($active=="merchanthistroy" ) class="active" @endif
                            href="{{ route('merchanthistroy') }}"><i class="fa fa-arrows" aria-hidden="true"></i>Payment
                            History</a></li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->commissionsetting)))
                    <li class="@@photogalleryactive"><a @if($active=="commission" ) class="active" @endif
                            href="{{ url('admin/commission') }}"><i class="zmdi zmdi-money"></i>Commission Settings</a>
                    </li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->coinsetting)))
                    <li class="@@photogalleryactive"><a @if($active=="coinlist" ) class="active" @endif
                            href="{{ url('admin/coinlist') }}"><i class="zmdi zmdi-money"></i>Tokens List</a></li>
                    @endif

                    @if(in_array("read", explode(',',$AdminProfiledetails->merchant_api)))
                    <li class="@@photogalleryactive"><a @if($active=="category" ) class="active" @endif
                            href="{{ url('admin/category') }}"><i class="zmdi zmdi-bookmark-outline"></i>Merchant Api
                            Category</a></li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->merchant_sub)))
                    <li class="@@photogalleryactive"><a @if($active=="subcategory" ) class="active" @endif
                            href="{{ url('admin/subcategory') }}"><i class="zmdi zmdi-format-list-bulleted"></i>Merchant
                            Sub Category</a></li>
                    @endif
                    @if(in_array("read", explode(',',$AdminProfiledetails->support)))

                    <li class="@@photogalleryactive"><a @if($active=="support" ) class="active" @endif
                            href="{{ url('/admin/support') }}"><i class="zmdi zmdi-ticket-star"></i> Support
                            ({{ ticketcount()}})<span class="pull-right"> </span></a></li>
                    @endif
                    {{-- @if(in_array("read", explode(',',$AdminProfiledetails->kyc_settings)))
                    <li class="@@photogalleryactive"><a @if($active=="kycsetting" ) class="active" @endif
                            href="{{ url('/admin/securityview') }}"><i class="zmdi zmdi-notifications"></i> KYC
                            Settings</a></li>
                    @endif --}}
                    @if(in_array("read", explode(',',$AdminProfiledetails->cms_settings)))
                    <li class="navigation__sub navigation__sub--toggled" id="herehead"><a href="#"><i class="zmdi zmdi-settings"
                                aria-hidden="true"></i>Site Settings</a>
                        <ul id="showdrops" style="display:none">
                            @php $selectedmenu = \Request::segment(2); @endphp
                            @php $selectedmenu3 = \Request::segment(3); @endphp

                            <li class="@@colorsactive"><a @if($selectedmenu=="tc" ) class="active" @endif
                                    href="{{ url('admin/tc') }}">Terms & Conditions</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="privacy" ) class="active" @endif
                                    href="{{ url('admin/privacy') }}">Privacy Policy</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="bannerview" ) class="active" @endif
                                    href="{{ url('admin/bannerview') }}">Home Banner</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="features" ) class="active" @endif
                                    href="{{ url('admin/features') }}">Features</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="aboutus" ) class="active" @endif
                                    href="{{ url('admin/aboutus') }}">About us</a></li>
                            <!-- <li class="@@colorsactive"><a href="{{ url('admin/accept_payment') }}">Accept Bitcoin Payments</a></li> -->
                            <li class="@@colorsactive"><a @if($selectedmenu=="homebanner" && $selectedmenu3 == 1) class="active" @endif
                                    href="{{ url('admin/homebanner')}}/{{ 1 }}">Home Banner One</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="homebanner" && $selectedmenu3 == 2) class="active" @endif
                                    href="{{ url('admin/homebanner')}}/{{ 2 }}">Home Banner Two</a></li>
                            <li class="@@colorsactive"><a @if($selectedmenu=="how" ) class="active" @endif
                                    href="{{ url('admin/how') }}">How It Works</a></li>
                        </ul>
                    </li>
                    @endif
                    @if(in_array("write", explode(',',$AdminProfiledetails->security)))
                    <li class="@@photogalleryactive"><a @if($active=="securitysetting" ) class="active" @endif
                            href="{{ url('admin/security') }}"><i class="zmdi zmdi-shield-check"
                                aria-hidden="true"></i>Security Settings </a></li>
                    @endif
                    <li class="@@photogalleryactive"><a href="{{ url('logout') }}"><i class="zmdi zmdi-power-off"></i>
                            Logout</a></li>
                </ul>
            </div>
        </aside>

        @yield('content')

        @include('layouts.footer')

        <script>

        $(".togglerwithdraw").on('click',function(){
            $(".listofwithdraw").toggle();
            $(".listoddeposits").hide();

        })

        $(".deposittoggler").on('click',function(){
            $(".listoddeposits").toggle();
            $(".listofwithdraw").hide();

        })
        $(document).ready(function() {

            $('#sidebarToggle').on('click', function(e) {
                e.stopPropagation();
                $('.sidebar').toggleClass('toggled');
            });

            $('.sidebar').on('click', function(e) {
                e.stopPropagation();
            });

            $(document).on('click', function() {
                $('.sidebar').removeClass('toggled');
            });

        });
        </script>

        <script>


            $("#herehead").on('click',function(){

                $('#showdrops').toggle();
            })
        $(document).click(function(e) {
            if (!$(e.target).closest('.sidebar, #sidebarToggle').length) {
                $('.sidebar').removeClass('open');
            }
        });
        </script>
