@php
$atitle ="cms";
@endphp
@extends('layouts.header')
@section('title', 'FAQ - Admin')
@section('content')
<section class="content">
  <div class="content__inner">
    <header class="content__title">
      <h1>FAQ Settings</h1>
    </header>
    <div class="card">
      <div class="card-body">
        <a href="{{ url('admin/faq') }}"><i class="zmdi zmdi-arrow-left"></i> Back to FAQ</a>
          <br /><br />
        <form method="POST" action="{{ url('admin\faq_update') }}">
        {{ csrf_field() }} 
        <input type="hidden" name="id" value="{{ $faq->id }}">
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Heading</label>
                </div>
              </div>
              <div class="col-md-9">
                <div class="form-group">
                  <input type="text" name="heading" class="form-control" value="{{ $faq->heading }}">
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3">
                <div class="form-group">
                  <label>Description</label>
                </div>
              </div>
              <div class="col-md-9">
                <div class="form-group">
                  <textarea name="description" class="form-control" >
                  {{ $faq->desc }}  
                  </textarea>
                  <i class="form-group__bar"></i> </div>
              </div>
            </div>  
          <div class="row">
            <div class="col-md-3">
              <div class="form-group">
                <label>&nbsp;</label>
              </div>
            </div>
            <div class="col-md-4">
               <button class="btn btn-md btn-warning" type="submit"> Update</button><br /><br />
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</section>
@endsection