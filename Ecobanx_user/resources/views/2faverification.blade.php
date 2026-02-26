@php $title = "Security"; $atitle ="Security";
@endphp
@include('layouts.headercss')

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
                        <h1>Security</h1>
                    </div>

                </div>

                <div class="support-card">
                    <div class="row">
                        <div class="col-lg-12 col-xl-1 col-md-12 col-sm-12 col-xs-12"></div>

                        <div class="col-lg-12 col-xl-10 col-md-12 col-sm-12 col-xs-12 security-inside">
                            @if (session('error'))
                            <div class="alert alert-danger">
                                {{ session('error') }}
                            </div>
                            @endif
                            @if (session('success'))
                            <div class="alert alert-success">
                                {{ session('success') }}
                            </div>
                            @endif
                            <div class="security">
                                <div class="authentication">
                                    <div class="google"><img src="{{url('/img/google-authentication.svg')}}" alt="">
                                    </div>
                                    <div>
                                        <h4>Google Authentication</h4>
                                        <p>Used for withdrawals and security modifications</p>
                                    </div>
                                </div>
                                <div class="enable-btn">
                                    @if($user->twofa == 'google_otp')
                                    @if($user->twofastatus == 0)
                                    <a href="{{ url('/enablegoogle') }}" class="deposit-green-cls">Enable</a>
                                    @else
                                    <a href="{{ url('/disablegoogleauth') }}" class="withdraw-cls">Disable</a>
                                    @endif
                                    @elseif($user->twofa == '')
                                    <a href="{{ url('/enablegoogle') }}" class="deposit-green-cls">Enable</a>
                                    @else
                                    <a href="{{ url('/enablegoogle') }}" class="deposit-green-cls">Enable</a>
                                    @endif
                                </div>
                            </div>

                            <div class="else">
                                <h5>OR</h5>
                            </div>

                            <div class="security">
                                <div class="authentication">
                                    <div class="google"><img src="{{ url('/img/email-ver.svg') }}" alt=""></div>
                                    <div>
                                        <h4>Email Verification</h4>
                                        <p>Send 2FA code via Email</p>
                                    </div>
                                </div>
                                <div class="enable-btn">
                                    @if($user->twofa == 'email_otp')
                                    @if($user->twofastatus == 0)
                                    <a href="{{ url('/enableemail') }}" class="deposit-green-cls">Enable</a>
                                    @else
                                    <a href="{{ url('/disableemail') }}" class="withdraw-cls">Disable</a>
                                    @endif
                                    @else
                                    <a href="{{ url('/enableemail') }}" class="deposit-green-cls">Enable</a>
                                    @endif
                                </div>
                            </div>

                            <div class="security backcolor">
                                <div class="authentication">
                                    <div class="google">
                                        <img src="{{ url('/img/kyc.svg') }}" alt="">
                                    </div>
                                    <div>
                                        @if(Auth::user()->role == 'Business')
                                        <h4>KYB Verification</h4>
                                        <p>Please Submit Your KYB For Better Use And Usability.</p>
                                        @else
                                        <h4>KYC Verification</h4>
                                        <p>Please Submit Your KYC For Better Use And Usability.</p>
                                        @endif
                                    </div>
                                </div>
                                <div class="enable-btn">
                                    @if(Auth::user()->kyc_verify == 1)
                                        @if(Auth::user()->role == 'Business')
                                                <button class="btn btn-primary" disabled>KYB Verified</button>
                                            @else
                                                <button class="btn btn-primary" disabled>KYC Verified</button>
                                        @endif
                                    @else
                                        @if($kycdetail == 0)
                                            <a href="{{ route('kycform') }}" class="btn-blue">Update</a>
                                        @endif
                                        @if($kycdetail == 3)
                                            <a  class="btn-blue" disabled>Pending</a>
                                        @endif
                                        @if($kycdetail == 2)
                                            <label style="color:red">Your KYC has been rejected</label>

                                            <a href="{{ route('kycform') }}" class="btn-blue">Re-submit</a>
                                        @endif
                                    @endif
                                </div>
                            </div>


                            <div class="security backcolor">
                                <div class="authentication">
                                    <div class="google"><img src="{{ url('/img/last-login.svg') }}" alt=""></div>
                                    <div>
                                        <h4>Last Login</h4>
                                        <p>@isset($login->created_at)
                                            {{ date('d/m/Y H:i:s',strtotime($login->created_at)) ?? ''}} @endisset</p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div class="col-lg-12 col-xl-1 col-md-12 col-sm-12 col-xs-12"></div>

                    </div>
                </div>

            </div>

        </div>
    </div>
</section>




<script>
var x, i, j, l, ll, selElmnt, a, b, c;
/* Look for any elements with the class "custom-select": */
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /* For each element, create a new DIV that will act as the selected item: */
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);
    /* For each element, create a new DIV that will contain the option list: */
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 1; j < ll; j++) {
        /* For each option in the original select element,
        create a new DIV that will act as an option item: */
        c = document.createElement("DIV");
        c.innerHTML = selElmnt.options[j].innerHTML;
        c.addEventListener("click", function(e) {
            /* When an item is clicked, update the original select box,
            and the selected item: */
            var y, i, k, s, h, sl, yl;
            s = this.parentNode.parentNode.getElementsByTagName("select")[0];
            sl = s.length;
            h = this.parentNode.previousSibling;
            for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                        y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
            }
            h.click();
        });
        b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function(e) {
        /* When the select box is clicked, close any other select boxes,
        and open/close the current select box: */
        e.stopPropagation();
        closeAllSelect(this);
        this.nextSibling.classList.toggle("select-hide");
        this.classList.toggle("select-arrow-active");
    });
}

function closeAllSelect(elmnt) {
    /* A function that will close all select boxes in the document,
    except the current select box: */
    var x, y, i, xl, yl, arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
        if (elmnt == y[i]) {
            arrNo.push(i)
        } else {
            y[i].classList.remove("select-arrow-active");
        }
    }
    for (i = 0; i < xl; i++) {
        if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
        }
    }
}

/* If the user clicks anywhere outside the select box,
then close all select boxes: */
document.addEventListener("click", closeAllSelect);
</script>


<script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
<script>
var options = {
    series: [{
        name: 'PRODUCT A',
        data: [44, 55, 41, 67]
    }, {
        name: 'PRODUCT B',
        data: [13, 23, 20, 8]
    }],
    dataLabels: {
        enabled: false
    },
    legend: {
        show: false
    },
    chart: {
        type: 'bar',
        height: 225,
        stacked: true,
        stackType: '100%',
        toolbar: {
            show: false
        }
    },
    responsive: [{
        breakpoint: 480,
        options: {
            legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0
            }
        }
    }],
    xaxis: {
        categories: ['2011', '2012', '2013', '2014'],
    },
    fill: {
        opacity: 1
    },
    legend: {
        position: 'right',
        offsetX: 0,
        offsetY: 50
    },
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
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
