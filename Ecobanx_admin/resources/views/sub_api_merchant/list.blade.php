@php
$atitle ="subcategory";
@endphp
@extends('layouts.header')
@section('title', 'Merchant Api SubCategory List')
@section('content')
<section class="content">
    <div class="content__inner">
        <header class="content__title">
            <h1 class="card-title">Merchant Api SubCategory List</h1>
        </header>
        <div class="row">

            <div class="col-md-12">
                <div class="row">
                    <div class="col-md-6">
                        <form action="{{ url('admin/subcategory') }}/filter" method="get">
                            {{ csrf_field() }}
                        <input type="text" id="myInput" name="searchphrase" value="{{ $searchphrase ?? '' }}" placeholder="Search for category or subcategory.." class="form-control">
                        <button type="submit" id="searchbtn" class="btn btn-primary btn-sm mt-2">Search</button>
                        <a type="button" class="btn btn-primary btn-sm mt-2" href="{{ url('admin/subcategory') }}">Reset</a>
                        </form>


                    </div>
                    <div class="col-md-6" style="text-align: right !important;">
                        @if(in_array("write", explode(',',$AdminProfiledetails->merchant_sub)))
                        <a href="{{ url('/admin/subaddcat') }}" class="btn btn-info">Add SubCategory</a>
                        @endif
                    </div>
                </div>

                </br><br>

                @if(session('status'))
                <div class="alert alert-success" role="alert">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                            aria-hidden="true">&times;</span></button><strong>Success!</strong> {{ session('status') }}
                </div>
                @endif
                <div class="card">
                    <div class="card-body">

                        <div class="table-responsive">

                            @if(count($forum) > 0)
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Category</th>
                                        <th>SubCategory</th>
                                        <th>Date/time</th>
                                        @if(in_array("write", explode(',',$AdminProfiledetails->merchant_sub)) || in_array("delete", explode(',',$AdminProfiledetails->merchant_sub)))
                                        <th>Action</th>
                                        @endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @php
                                    $limit=10;
                                    $i=1;
                                    if(isset($_GET['page'])){
                                    $page = $_GET['page'];
                                    $i = (($limit * $page) - $limit)+1;
                                    }else{
                                    $i =1;
                                    }
                                    @endphp
                                    @foreach($forum as $key => $value)
                                    <tr>
                                        <td>{{ $i }}</td>
                                        @php

                                        $apicat = \App\Models\Apicategory::where('id',$value->cat_id)->first();
                                        @endphp
                                        <td>{{ $apicat->category }}</td>
                                        <td><?php echo $value->sub_title, 0, 30, '...';?></td>
                                        <td>{{ $value->created_at }}</td>
                                        <td>

                                        @if(in_array("read", explode(',',$AdminProfiledetails->merchant_sub)))
                                            <a href="{{ url('/admin/subviewcategory', Crypt::encrypt($value->id)) }}"
                                                class="btn btn-info">View / Edit </a>
                                            @endif
                                            @if(in_array("delete", explode(',',$AdminProfiledetails->merchant_sub)))
                                            <a href="{{ url('/admin/subcat_delete/'.Crypt::encrypt($value->id)) }}"
                                                class="btn btn-info">Remove </a>
                                            @endif
                                        </td>
                                    </tr>
                                    @php $i++; @endphp
                                    @endforeach
                                </tbody>
                            </table>
                            {{ $forum->links() }}
                            @else
                            {{ 'No Records Settings' }}
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
</section>
@endsection
