@include('layouts.headercss')
@extends('layouts.app')

@section('content')



<section class="Dashboard-page wallet-page-main">
    <div class="container-fluid">
        <div class="row">
            @include('layouts.menu')


            <div class="col-lg-10 col-xl-10 col-md-12 col-sm-12 col-xs-12">

                <div class="header-part-outer">
                    <div class="common-header-style title-outer">
                        <div class="row">

                            <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                                <div class="logo-payment"><a href="dashboard.html"><img src="{{ url('img/logo.png') }}"
                                            alt="logo"></a></div>
                            </div>

                            <div class="col-lg-6 col-xl-6 col-md-6 col-sm-6 col-xs-6">
                                <div class="notify-part">
                                    <div class="notify"><img src="{{ url('img/Notification.png') }}"></div>
                                    <div class="message"><img src="{{ url('img/message.png') }}"></div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="head-title-part">
                        <h1>KYC Verification</h1>
                    </div>

                </div>


                <div class="dashboard-body wallet-body">

                    <div class="row">
                        <div class="col-lg-12 col-xl-12 col-md-12 col-sm-12 col-xs-12">
                            <div class="kyc-wrapper">
                                <form action="{{ route('kyc-save') }}" method="POST" enctype="multipart/form-data">
                                    @csrf
                                    <input type="hidden" name="uid" value="{{ auth()->user()->id ?? ""}}">
                                    <div class="kyc-card">
                                        <h4 class="kyc-title">PERSONAL INFORMATION</h4>

                                        <div class="row kyc-row">
                                            <div class="col-md-6">
                                                <label>First Name <span class="required-clr">*<span></label>
                                                <input type="text" name="fname" value="{{ old('fname') }}"
                                                    class="form-control kyc-input required-field">
                                                <small class="error-msg"></small>
                                                @error('fname')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>Last Name <span class="required-clr">*<span></label>
                                                <input type="text" name="lname" value="{{ old('lname') }}"
                                                    class="form-control kyc-input required-field">
                                                <small class="error-msg"></small>
                                                @error('lname')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>Phone Number</label>
                                                <input type="text" name="phone_no" value="{{ old('phone_no') }}" class="form-control kyc-input required-field">
                                                @error('phone_no')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>Gender <span class="required-clr">*<span></label>
                                                <select name="gender_type"  class="form-control kyc-input required-field">
                                                    <option value="">Select Gender</option>
                                                    <option value="male" @if(old('gender_type') == "male") selected @endif>Male</option>
                                                    <option value="female" @if(old('gender_type') == "female") selected @endif>Female</option>
                                                </select>
                                                <small class="error-msg"></small>
                                                @error('gender_type')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror

                                            </div>

                                            <div class="col-md-6">
                                                <label>Date of Birth <span class="required-clr">*<span></label>
                                                <input type="date" name="dob" value="{{ old('dob') }}"
                                                    class="form-control kyc-input required-field">
                                                <small class="error-msg"></small>
                                                @error('dob')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>Country <span class="required-clr">*<span></label>
                                                <select name="country" class="form-control kyc-input required-field">
                                                    <option value="">Select Country</option>
                                                    @foreach ($country as $countries)
                                                        <option value="{{ $countries->id ?? ''}}" @if(old('country') == $countries->id) selected @endif>{{ $countries->name ?? ''}}</option>
                                                    @endforeach
                                                </select>
                                                <small class="error-msg"></small>
                                                @error('country')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>


                                            <div class="col-md-6">
                                                <label>State <span class="required-clr">*<span></label>
                                                <input type="text" name="state" value="{{ old('state') }}"
                                                    class="form-control kyc-input required-field">
                                                <small class="error-msg"></small>
                                                @error('state')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>City <span class="required-clr">*<span></label>
                                                <input type="text" name="city" value="{{ old('city') }}"
                                                    class="form-control kyc-input required-field">
                                                    @error('city')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>
                                            <div class="col-md-6">
                                                <label>Zip / Postal Code <span class="required-clr">*<span></label>
                                                <input type="text" name="zip_code" value="{{ old('zip_code') }}" class="form-control kyc-input required-field">
                                                <small class="error-msg"></small>
                                                    @error('zip_code')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>Telegram Username</label>
                                                <input type="text" name="telegram_name" value="{{ old('telegram_name') }}" class="form-control kyc-input">
                                            </div>

                                            <div class="col-md-6">
                                                <label>Address Line 1 <span class="required-clr">*<span></label>
                                                <textarea name="address_line1"
                                                    class="form-control kyc-input required-field">{{ old('telegram_name') ?? ""}}</textarea>
                                                <small class="error-msg"></small>
                                                 @error('address_line1')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror

                                            </div>

                                            <div class="col-md-6">
                                                <label>Address Line 2</label>
                                                <textarea name="address_line2" class="form-control kyc-input">{{ old('address_line2') ?? ""}}</textarea>
                                            </div>
                                        </div>
                                        <p class="kyc-note">
                                            Note: Please type carefully and fill out the form with your personal
                                            details.
                                            You are not allowed to edit the details once you have submitted the
                                            application.
                                        </p>
                                    </div>


                                    <div class="kyc-card mt-4">
                                        <h4 class="kyc-title">ID PROOF DETAILS</h4>

                                        <p class="kyc-note">
                                            Upload here your Passport (your photo and all 4 corners of your ID /
                                            Passport
                                            must be visible). There is no light glare or reflections on the card.
                                        </p>

                                        <div class="row kyc-row">

                                            <div class="col-md-6">
                                                <label>ID document type <span class="required-clr">*<span></label>
                                                <select name="id_type" class="form-control kyc-input required-field">
                                                    <option value="">Select ID Type</option>
                                                    <option value="passport" @if(old('id_type') == "passport") selected @endif>Passport</option>
                                                    <option value="national_id"  @if(old('id_type') == "national_id") selected @endif>National ID</option>
                                                    <option value="driving_license"  @if(old('id_type') == "driving_license") selected @endif>Driving License</option>
                                                    <option value="government_issue_id"  @if(old('id_type') == "government_issue_id") selected @endif>Government Issue ID</option>
                                                    <option value="others"  @if(old('id_type') == "others") selected @endif>others</option>
                                                </select>
                                                <small class="error-msg"></small>
                                                @error('id_type')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6">
                                                <label>ID document number <span class="required-clr">*<span></label>
                                                <input type="text" name="id_number" value="{{ old('id_number') }}" class="form-control kyc-input">
                                                @error('id_number')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                            <div class="col-md-6 mt-3">
                                                <label>Expiry Date</label>
                                                <input type="date" name="id_exp" value="{{ old('id_exp') }}" class="form-control kyc-input">
                                                @error('id_exp')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                            </div>

                                        </div>

                                    </div>



                                    <!-- DOCUMENT UPLOAD -->
                                    <div class="kyc-card mt-4">
                                        <h3 class="kyc-title">DOCUMENT UPLOAD</h3>

                                        <div class="row text-center">

                                            <!-- ID FRONT -->
                                            <div class="col-md-4">
                                                <div class="upload-box text-center">

                                                    <p>ID Front Document</p>

                                                    <div class="upload-preview-content">
                                                        <img id="frontPreview" src="{{ asset('img/ID_card_front.png') }}"
                                                            class="upload-preview">
                                                    </div>
                                                    <div>
                                                        <input type="file" name="front_img" id="id_front" hidden
                                                            class="required-field"
                                                            onchange="previewImage(event,'frontPreview')">
                                                        <small class="error-msg"></small>
                                                        @error('front_img')
                                                    <span class="text-danger">{{ $message }}</span>
                                                @enderror
                                                    </div>

                                                    <button type="button" class="btn update-btn mt-2"
                                                        onclick="document.getElementById('id_front').click()">
                                                        Upload Here
                                                    </button>

                                                </div>
                                            </div>


                                            <!-- ID BACK -->
                                            <div class="col-md-4">
                                                <div class="upload-box">
                                                    <p>ID Back Document</p>

                                                    <div class="upload-preview-content">
                                                        <img id="backPreview" src="{{ asset('img/ID_card_back.png') }}"
                                                            class="upload-preview">
                                                    </div>
                                                    <div>
                                                        <input type="file" name="back_img" id="id_back" hidden
                                                            class="required-field"
                                                            onchange="previewImage(event,'backPreview')">

                                                        <small class="error-msg"></small>
                                                        @error('back_img')
                                                    <span class="text-danger">{{ $message }}</span>
                                                        @enderror
                                                    </div>


                                                    <button type="button" class="btn update-btn mt-2"
                                                        onclick="document.getElementById('id_back').click()">
                                                        Upload Here
                                                    </button>

                                                    <small id="backName"></small>
                                                </div>
                                            </div>

                                            <!-- SELFIE -->
                                            <div class="col-md-4">
                                                <div class="upload-box">
                                                    <p>Selfie with ID</p>

                                                    <div class="upload-preview-content">
                                                        <img id="selfiePreview" src="{{ asset('img/selfie_id.png') }}"
                                                            class="upload-preview">
                                                    </div>
                                                    <div>
                                                        <input type="file" name="selfie_img" id="selfie" hidden
                                                            class="required-field"
                                                            onchange="previewImage(event,'selfiePreview')">
                                                        <small class="error-msg"></small>
                                                        @error('selfie_img')
                                                    <span class="text-danger">{{ $message }}</span>
                                                        @enderror
                                                    </div>


                                                    <button type="button" class="btn update-btn mt-2"
                                                        onclick="document.getElementById('selfie').click()">
                                                        Upload Here
                                                    </button>

                                                    <small id="selfieName"></small>
                                                </div>
                                            </div>

                                        </div>
                                    </div>


                                    <div class="kyc-card mt-4">

                                        <h4 class="kyc-title">PROOF ADDRESS</h4>

                                        <div class="row">

                                            <!-- LEFT SIDE -->
                                            <div class="col-md-6">

                                                <label style="color: #000">Proof of address <span
                                                        class="required-clr">*<span></label>
                                                <select name="proofpaper"
                                                    class="form-control kyc-input required-field">
                                                    <option value="">Select proof type</option>
                                                    <option value="bank_statement" @if(old('proofpaper') == "bank_statement") ? selected @endif>Bank Statement</option>
                                                    <option value="utility_bill" @if(old('proofpaper') == "utility_bill") ? selected @endif>Utility Bill (gas,electricity,water)
                                                    </option>
                                                    <option value="tax_statement" @if(old('proofpaper') == "tax_statement") ? selected @endif>Tax Statement</option>
                                                    <option value="pension_statement" @if(old('proofpaper') == "pension_statement") ? selected @endif>Pension Statement</option>
                                                    <option value="telephone_bill" @if(old('proofpaper') == "telephone_bill") ? selected @endif>Telephone / internet bill (no cell
                                                        phone bill)</option>
                                                    <option value="certificate_registration" @if(old('proofpaper') == "certificate_registration") ? selected @endif>Certificate of registration
                                                    </option>
                                                    <option value="bank_confirmation" @if(old('proofpaper') == "bank_confirmation") ? selected @endif>Bank confirmation</option>
                                                </select>
                                                <small class="error-msg"></small>
                                                @error('proofpaper')
                                                    <span class="text-danger">{{ $message }}</span>
                                                        @enderror

                                                <ul class="kyc-doc-list">
                                                    <li>Utility bills (gas, electricity, water)</li>
                                                    <li>Telephone / Internet bill (no cell phone bill)</li>
                                                    <li>Pension statement</li>
                                                    <li>Tax statement</li>
                                                    <li>Certificate of registration</li>
                                                    <li>Bank confirmation</li>
                                                    <li>Advertising letters are not accepted!</li>
                                                </ul>

                                            </div>

                                            <!-- RIGHT SIDE UPLOAD -->
                                            <div class="col-md-6">

                                                <div class="upload-box text-center">

                                                    <p class="upload-title">
                                                        Residential document or phone document upload <span
                                                            class="required-clr">*<span>
                                                    </p>
                                                    <div class="upload-preview-content residental-adj">

                                                        <img id="addressPreview" src="{{ asset('img/file_residential.jpg') }}"
                                                            class="upload-preview">

                                                        <input type="file" name="proofpaper_img" id="address_proof"
                                                            class="required-field" hidden
                                                            onchange="previewImage(event,'addressPreview')">

                                                              <small class="error-msg"></small>
                                                              @error('proofpaper_img')
                                                    <span class="text-danger">{{ $message }}</span>
                                                        @enderror
                                                    </div>

                                                    <button type="button" class="btn update-btn mt-2"
                                                        onclick="document.getElementById('address_proof').click()">
                                                        UPLOAD HERE..
                                                    </button>

                                                    <p class="upload-note">
                                                        Please photograph the complete document
                                                        (all 4 corners must be visible).
                                                        The document must contain the same address
                                                        as your ID card.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        <!-- ORANGE NOTE -->
                                        <p class="kyc-note mt-4">
                                            Note: To avoid delays with verification process,
                                            please double-check to ensure the above requirements
                                            are fully met. Chosen credential must not be expired.
                                        </p>


                                        <!-- DECLARATION -->
                                        <div class="kyc-declaration">

                                            <label>
                                                <input type="checkbox" name="agreement[]">
                                                I have read the Terms and Condition and AML-KYC.
                                            </label>

                                            <label>
                                                <input type="checkbox" name="agreement[]">
                                                All the personal information I have entered is correct.
                                            </label>

                                            <label>
                                                <input type="checkbox" name="agreement[]">
                                                I certify that I am registering as an individual,
                                                not as a corporate representative.
                                            </label>

                                        </div>
                                        @error('agreement')
                                            <span class="text-danger">{{ $message }}</span>
                                        @enderror
                                    </div>


                                    <br>
                                    <div class="d-flex justify-content-center">

                                        <button class="btn btn-success" type="submit">Submit KYC</button>
                                    </div>

                                </form>


                            </div>

                        </div>
                    </div>

                </div>

            </div>

        </div>
    </div>
</section>

<script>
function showFileName(input, id) {
    document.getElementById(id).innerText =
        input.files[0]?.name || '';
}
</script>

<script>
function previewImage(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById(previewId).src = reader.result;
    };
    reader.readAsDataURL(file);
}
</script>


<!-- <script>
document.getElementById("kycSubmit").addEventListener("click", function(e) {

    let valid = true;

    document.querySelectorAll(".required-field").forEach(field => {

        const error = field.parentElement.querySelector(".error-msg");

        if (!field.value || field.value.trim() === "") {
            valid = false;
            if (error) {
                error.innerText = "This field is required";
            }
            field.style.border = "1px solid red";
        } else {
            if (error) {
                error.innerText = "";
            }
            field.style.border = "";
        }

    });

    if (!valid) {
        e.preventDefault();
    }

});
</script> -->


<script>
document.getElementById("kycSubmit").addEventListener("click", function(e) {

    let valid = true;

    document.querySelectorAll(".required-field").forEach(field => {

        let error = field.parentElement.querySelector(".error-msg");

        // FILE INPUT VALIDATION
        if (field.type === "file") {
            if (field.files.length === 0) {
                valid = false;
                if (error) error.innerText = "Please upload this file";
                field.style.border = "1px solid red";
            } else {
                if (error) error.innerText = "";
                field.style.border = "";
            }
        }

        // SELECT VALIDATION
        else if (field.tagName === "SELECT") {
            if (field.value === "") {
                valid = false;
                if (error) error.innerText = "Please select an option";
                field.style.border = "1px solid red";
            } else {
                if (error) error.innerText = "";
                field.style.border = "";
            }
        }

        // TEXT INPUT / TEXTAREA VALIDATION
        else {
            if (!field.value.trim()) {
                valid = false;
                if (error) error.innerText = "This field is required";
                field.style.border = "1px solid red";
            } else {
                if (error) error.innerText = "";
                field.style.border = "";
            }
        }

    });

    // Prevent submit if any error
    if (!valid) {
        e.preventDefault();

        // Scroll to first error field
        const firstError = document.querySelector(".error-msg:not(:empty)");
        if (firstError) {
            firstError.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }
    }

});
</script>

<script>

// Remove error while typing or selecting
document.querySelectorAll(".required-field").forEach(field => {

    // INPUT & TEXTAREA
    field.addEventListener("input", function(){
        validateField(this);
    });

    // SELECT & FILE
    field.addEventListener("change", function(){
        validateField(this);
    });

});

function validateField(field){

    let error = field.parentElement.querySelector(".error-msg");

    // FILE VALIDATION
    if(field.type === "file"){
        if(field.files.length > 0){
            error.innerText = "";
            field.style.border = "";
        }
    }

    // SELECT VALIDATION
    else if(field.tagName === "SELECT"){
        if(field.value !== ""){
            error.innerText = "";
            field.style.border = "";
        }
    }

    // TEXT INPUT VALIDATION
    else{
        if(field.value.trim() !== ""){
            error.innerText = "";
            field.style.border = "";
        }
    }

}

</script>
