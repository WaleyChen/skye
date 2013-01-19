class HomeController < ApplicationController
  def index
    redirect_to(schedule_url) unless session[:access_token].nil?
  end
end
