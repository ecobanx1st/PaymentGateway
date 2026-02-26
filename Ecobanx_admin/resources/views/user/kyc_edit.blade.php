@php
    $atitle = 'user';
@endphp
@extends('layouts.header')
@section('title', 'Users List - Admin')
@section('content')
    <section class="content">
        <div class="content__inner">
            <header class="content__title">
                <h1>KYC Submits</h1>
            </header>
            @if (session('status'))

                <div class="alert alert-success">
                    {{ session('status') }}
                </div>
            @endif
            @if (session('error'))
                <div class="alert alert-danger">
                    {{ session('error') }}
                </div>
            @endif
            <div class="card">
                <div class="card-body">
                    <a href="{{ url('admin/kyc') }}"><i class="zmdi zmdi-arrow-left"></i> Back to KYC Submit</a>
                    <br />
                    <br />
                    <form method="POST" action="{{ url('admin/kycupdate') }}" enctype="multipart/form-data">

                        {{ csrf_field() }}

                        <input type="hidden" name="kycid" value="{{ $kyc->id ?? '' }}">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>First Name</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="fname" class="form-control" value="{{ $kyc->fname }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Last Name</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="lname" class="form-control" value="{{ $kyc->lname }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Gender</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    {{-- <input type="text" name="gender_type" class="form-control" > --}}
                                    <select name="gender_type" class="form-control">
                                        <option value="">Selecte Gender</option>
                                        <option value="male" @if ($kyc->gender_type == 'male') selected @endif>Male
                                        </option>
                                        <option value="female" @if ($kyc->gender_type == 'female') selected @endif>Female
                                        </option>
                                    </select>
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Date of Birth</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="dob" class="form-control date-picker"
                                        value="{{ $kyc->dob }}" readonly>
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>State</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="state" class="form-control" value="{{ $kyc->state }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>City</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="city" class="form-control" value="{{ $kyc->city }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Zip Code</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="zip_code" class="form-control" value="{{ $kyc->zip_code }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Country</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">

                                    <select name="country" class="form-control">
                                        <option value="">Select Country</option>
                                        @foreach ($countrylist as $countrylists)
                                            <option value="{{ $countrylists->id ?? '' }}"
                                                @if ($kyc->country == $countrylists->id) selected @endif>
                                                {{ $countrylists->name ?? '' }}</option>
                                        @endforeach
                                    </select>
                                    <i class="form-group__bar"></i>
                                </div>

                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Telegram Name</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="telegram_name" class="form-control"
                                        value="{{ $kyc->telegram_name }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Address Line1</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <textarea name="address_line1" class="form-control">{{ $kyc->address_line1 ? $kyc->address_line1 : '-' }}</textarea>
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Address Line2</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <textarea name="address_line2" class="form-control">{{ $kyc->address_line2 ? $kyc->address_line2 : '-' }}</textarea>
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>


                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>ID Type</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    {{-- <input type="text" name="id_type" class="form-control" value="{{ $kycId[$kyc->id_type] ?? ''}}" >
                <i class="form-group__bar"></i> </div> --}}
                                    <select name="id_type" class="form-control">
                                        <option>Select Document</option>
                                        <option value="passport" @if ($kyc->id_type == 'passport') selected @endif>Passport
                                        </option>
                                        <option value="national_id" @if ($kyc->id_type == 'national_id') selected @endif>
                                            National ID</option>
                                        <option value="driving_license" @if ($kyc->id_type == 'driving_license') selected @endif>
                                            Driving License</option>
                                        <option value="government_issue_id"
                                            @if ($kyc->id_type == 'government_issue_id') selected @endif>Government Issue ID</option>
                                        <option value="others" @if ($kyc->id_type == 'others') selected @endif>Others
                                        </option>


                                    </select>
                                    <i class="form-group__bar"></i>
                                </div>

                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>ID Number</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="text" name="id_number" class="form-control"
                                        value="{{ $kyc->id_number }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>ID Expiry Date</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <input type="date" name="id_exp" class="form-control"
                                        value="{{ $kyc->id_exp }}">
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>


                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>ID Front Document</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group"><a target="_blank" href="{{ public_path($kyc->front_img) }}"><img
                                            width="200px" src="{{ public_path($kyc->front_img) }}"></a> </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>ID Back Document</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group"><a target="_blank" href="{{ public_path($kyc->back_img) }}"><img
                                            width="200px" src="{{ public_path($kyc->back_img) }}"></a></div>
                            </div>
                        </div>


                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Selfie Image Document</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group"><a target="_blank" href="{{ public_path($kyc->selfie_img) }}"><img
                                            width="200px" src="{{ public_path($kyc->selfie_img) }}"></a> </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Recident Document</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group"><a target="_blank" href="{{ public_path($kyc->proofpaper_img) }}"><img
                                            width="200px" src="{{ public_path($kyc->proofpaper_img) }}"></a></div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Address Document Type</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    <select name="proofpaper" class="form-control">
                                        <option value="">Select Proof Type</option>
                                        <option value="bank_statement" @if($kyc->proofpaper == "bank_statement") selected @endif>Bank statement</option>
                                        <option value="utility_bill" @if($kyc->proofpaper == "utility_bill") selected @endif>Utility Bill</option>
                                        <option value="tax_statement" @if($kyc->proofpaper == "tax_statement") selected @endif>Tax Statement</option>
                                        <option value="pension_statement" @if($kyc->proofpaper == "pension_statement") selected @endif>Pension Statement</option>
                                        <option value="telephone_bill" @if($kyc->proofpaper == "telephone_bill") selected @endif>Telephone Bill</option>
                                        <option value="certificate_registration" @if($kyc->proofpaper == "certificate_registration") selected @endif>Certificate Registration</option>
                                        <option value="bank_confirmation" @if($kyc->proofpaper == "bank_confirmation") selected @endif>Bank Confirmation</option>
                                    </select>
                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>


                        <!--     <div class="row">
                <div class="col-md-3">
                  <div class="form-group">
                    <label>Selfie identity photo</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-group"><a target="_blank" href="{{ $kyc->selfie_img }}"><img width="200px" src="{{ $kyc->selfie_img }}"></a></div>
                </div>
              </div> -->

                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Status</label>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group">
                                    @if($kyc->status != 1 && $kyc->status != 2)
                                    <select class="form-control" name="status"
                                        @if ($kyc->status != 0 && $kyc->status != 3) disabled @endif>
                                        <option value="0" @if ($kyc->status == 0) selected @endif>Waiting
                                        </option>
                                        <option value="1" @if ($kyc->status == 1) selected @endif>Accepted
                                        </option>
                                        <option value="2" @if ($kyc->status == 2) selected @endif>Rejected
                                        </option>
                                    </select>
                                    @else
                                    @php
                                        $statusHere = ($kyc->status == 1) ? "accepted" : "rejected"
                                    @endphp
                                    <input type="text" class="form-control" name="status" value="{{ ucwords($statusHere) ?? ''}}" readonly>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>Remark</label>
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="form-group">

                                        <textarea type="text" name="remark" class="form-control">{{ $kyc->remark ? $kyc->remark : ' ' }}</textarea>

                                    <i class="form-group__bar"></i>
                                </div>
                            </div>
                        </div>

                        <br>
                        {{-- <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="nameandsurname"
                                name="nameandsurname">
                            <label class="form-check-label" for="nameandsurname">Name and Surname matches ID
                                document</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="namematchesproof"
                                name="namematchesproof">
                            <label class="form-check-label" for="namematchesproof">Name matches on Proof of residence,
                                Bank statement etc</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="dobmatches"
                                name="dobmatches">
                            <label class="form-check-label" for="dobmatches">Date of birth matches ID number</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="selfiesmatches"
                                name="selfiesmatches">
                            <label class="form-check-label" for="selfiesmatches">Selfies matches ID</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="idnumbermatches"
                                name="idnumbermatches">
                            <label class="form-check-label" for="idnumbermatches">Id number matches ID document</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="iddocument"
                                name="iddocument">
                            <label class="form-check-label" for="iddocument">Id documents is legitimate</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="addressproofmatches"
                                name="addressproofmatches">
                            <label class="form-check-label" for="addressproofmatches">Address matches proof of
                                residences</label>
                        </div>

                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="1" id="proofofresidence"
                                name="proofofresidence">
                            <label class="form-check-label" for="proofofresidence">Proof of Residence not older than 3
                                months</label>
                        </div> --}}


                        <div class="row">
                            <div class="col-md-3">
                                <div class="form-group">
                                    <label>&nbsp;</label>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <input type="hidden" name="kyc_id" value="{{ $kyc->id }}" />
                                <input type="hidden" name="uid" value="{{ $kyc->uid }}" />
                                @if(in_array("write", explode(',',$AdminProfiledetails->kyc)))
                                    <input type="submit" class="btn btn-md btn-warning" value="Update"> <br /><br />
                                    <p class='text text-info'>Note : Once you accept / reject kyc, You can't update the status
                                        again!</p>
                                @endif
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <script>
        @if ($errors->any())
            toastr.error('{{ $errors->first() }}');
        @endif
    </script>

@endsection
