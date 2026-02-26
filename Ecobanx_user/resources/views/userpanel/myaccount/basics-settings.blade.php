@php $title = "Account Setting"; $atitle ="Account";
@endphp
@include('layouts.headercss')

<section class="Dashboard-page">
    <div class="container-fluid">
        <div class="row">

            @include('layouts.menu')


            <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

                <div class="header-part-outer">

                    <div class="head-title-part">
                        <h1>Basic Settings</h1>
                    </div>

                </div>


                <div class="account-setting-body">


                    <ul class="nav nav-pills" role="tablist">
                        <li class="nav-item">
                            <a class="nav-link active" data-bs-toggle="pill" href="{{ route('basicsetting') }}">Basic
                                Setting</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="{{ route('merchantsetting') }}">Merchant Setting</a>
                        </li>
                    </ul>

                    <!-- Tab panes -->
                    <div class="tab-content">
                        <div id="home" class="tab-pane active">
                            <h3>Basic Setting</h3>
                            <div class="row">

                                <div class="col-lg-7 col-xl-7 col-md-7 col-sm-12 col-xs-12">
                                    @if (session('success'))
                                    <div class="alert alert-success">
                                        {{ session('success') }}
                                    </div>
                                    @endif
                                    <form method="POST" action="{{ url('/account-setting-update') }}">
                                        {{ csrf_field() }}

                                        <div class="form-group">
                                            <label>Your Merchant ID</label>
                                            <input type="text" class="form-control" name="" value="{{ $merchant_id }}"
                                                readonly="">
                                        </div>

                                        <div class="form-group">
                                            <label>Account KYC Status</label>
                                            @if($datas->kyc_verify == 1)
                                            <input type="text" class="form-control" name="" value="Verified"
                                                readonly="">
                                            @else
                                            <input type="text" class="form-control" name="" value="Unverified"
                                                readonly="">
                                            <span class="kyctext-right"><a href="{{ url('kyc-verify') }}"
                                                    class="alinktext">Verify Now</a></span>
                                            @endif
                                        </div>

                                        <div class="form-group">
                                            <label>Account Email</label>
                                            <input type="text" class="form-control" name="" value="{{ $datas->email }}"
                                                readonly="">
                                        </div>

                                        <div class="form-group">
                                            <label>Gender</label>
                                            <select class="form-control" name="sex">
                                                <option value="">Select gender</option>
                                                <option value="Other"
                                                    <?php if(isset($UsersProfile->gender) &&  $UsersProfile->gender == "Other") echo "selected"; ?>>
                                                    Other/Prefer Not To Say</option>
                                                <option value="Male"
                                                    <?php if(isset($UsersProfile->gender) &&  $UsersProfile->gender == "Male") echo "selected"; ?>>
                                                    Male</option>
                                                <option value="Female"
                                                    <?php if(isset($UsersProfile->gender) &&  $UsersProfile->gender == "Female") echo "selected"; ?>>
                                                    Female</option>
                                            </select>
                                            @if ($errors->has('sex'))
                                            <span class="help-block">
                                                <strong class="text text-danger">{{ $errors->first('sex') }}</strong>
                                            </span>
                                            @endif
                                        </div>
                                        <div class="form-group">
                                            <label>Optional Emails</label>
                                            <div class="form-group receive-email" style="margin-bottom: 0px;">
                                                <input name="optional_email" type="checkbox" value="1"
                                                    @if(isset($UsersProfile->optional_mail) &&
                                                $UsersProfile->optional_mail == 1) checked="" @endif /><label>Receive
                                                    electronic communications from Eco Banx Pay Inc</label>
                                            </div>
                                        </div>
                                        <div class="Update-Settings"><button type="submit">Update Settings</button>
                                        </div>
                                    </form>


                                </div>

                                <div class="col-lg-5 col-xl-5 col-md-5 col-sm-12 col-xs-12">
                                    <div class="bassic-setting-img"><img src="{{ url('img/bassic-setting-img.png') }}">
                                    </div>
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